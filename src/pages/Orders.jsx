import React, { useEffect, useState } from "react";
import Sidebar from "../componenets/Sidebar";
import { db } from "../hooks/firebase";
import { collection, getDocs, query, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "orders"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          customer: {
            name: d.customerName || "Unknown",
            email: d.email || "Unknown",
            phone: d.phone || "Unknown",
          },
          items: d.items || [],
          totalAmount: d.totalAmount || 0,
          status: d.status || "Pending",
          createdAt: d.createdAt,
        };
      });
      
      // Sort orders by date (newest first)
      const sortedData = data.sort((a, b) => {
        // Handle cases where createdAt might be null
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1; // Push null dates to the end
        if (!b.createdAt) return -1; // Push null dates to the end
        
        // Compare timestamps (newest first)
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      
      setOrders(sortedData);
      setFilteredOrders(sortedData);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (filter) => {
    setActiveFilter(filter);
    if (filter === "all") {
      setFilteredOrders(orders);
    } else if (filter === "incomplete") {
      setFilteredOrders(orders.filter(order => 
        order.status.toLowerCase() !== "complete"
      ));
    } else if (filter === "completed") {
      setFilteredOrders(orders.filter(order => 
        order.status.toLowerCase() === "complete"
      ));
    }
  };

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "complete":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const markComplete = async (orderId) => {
    try {
      setUpdating(orderId);
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "complete" });

      setOrders((prev) => {
        const updated = prev.map((order) =>
          order.id === orderId ? { ...order, status: "complete" } : order
        );
        // Re-sort after update to maintain order
        return updated.sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });
      });
      
      // Reapply filter after update
      filterOrders(activeFilter);
    } catch (err) {
      console.error("Error updating order:", err);
    } finally {
      setUpdating(null);
    }
  };

  const deleteOrder = async (orderId, customerName) => {
    // Confirmation dialog before deletion
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the order from ${customerName}? This action cannot be undone.`
    );
    
    if (!isConfirmed) return;
    
    try {
      setDeleting(orderId);
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);

      // Update state to remove the deleted order
      setOrders((prev) => {
        const updated = prev.filter((order) => order.id !== orderId);
        return updated;
      });
      
      // Reapply filter after deletion
      filterOrders(activeFilter);
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders(activeFilter);
  }, [orders, activeFilter]);

  // Format date helper function
  const formatDate = (timestamp) => {
    if (!timestamp) return "No date";
    const date = timestamp.toDate();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const filterButtons = [
    { id: "all", label: "All Orders", count: orders.length },
    { 
      id: "incomplete", 
      label: "Incomplete", 
      count: orders.filter(order => order.status.toLowerCase() !== "complete").length 
    },
    { 
      id: "completed", 
      label: "Completed", 
      count: orders.filter(order => order.status.toLowerCase() === "complete").length 
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 md:ml-64 transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Refresh Orders
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            {filterButtons.map((filter) => (
              <button
                key={filter.id}
                onClick={() => filterOrders(filter.id)}
                className={`flex-1 flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
                  activeFilter === filter.id
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{filter.label}</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeFilter === filter.id
                    ? "bg-green-700 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">
              {activeFilter === "completed" ? "✓" : 
               activeFilter === "incomplete" ? "⏳" : "📦"}
            </div>
            <p className="text-gray-500 text-lg">
              {activeFilter === "completed" ? "No completed orders found." :
               activeFilter === "incomplete" ? "No incomplete orders found." :
               "No orders found."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-md rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-100 gap-2 sm:gap-0">
                  <div>
                    <h2 className="font-semibold text-lg text-gray-900">
                      {order.customer.name}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Email: {order.customer.email}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Phone: {order.customer.phone}
                    </p>
                    {order.createdAt && (
                      <p className="text-gray-400 text-xs mt-1">
                        Order Date: {formatDate(order.createdAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-col items-start sm:items-end mt-2 sm:mt-0 gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <div className="flex gap-2">
                      {order.status.toLowerCase() !== "complete" && (
                        <button
                          onClick={() => markComplete(order.id)}
                          disabled={updating === order.id || deleting === order.id}
                          className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${
                            updating === order.id || deleting === order.id
                              ? "bg-blue-300 cursor-not-allowed" 
                              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                          }`}
                        >
                          {updating === order.id ? "Updating..." : "Mark Complete"}
                        </button>
                      )}
                      <button
                        onClick={() => deleteOrder(order.id, order.customer.name)}
                        disabled={updating === order.id || deleting === order.id}
                        className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${
                          deleting === order.id
                            ? "bg-red-300 cursor-not-allowed" 
                            : "bg-red-600 hover:bg-red-700 active:scale-95"
                        }`}
                      >
                        {deleting === order.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items Table / Mobile-Friendly Cards */}
                <div className="overflow-x-auto">
                  {/* Desktop Table */}
                  <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.productId}>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">₦{item.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">₦{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Cards */}
                  <div className="sm:hidden flex flex-col divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <div key={item.productId} className="p-4 bg-gray-50 rounded-lg mb-2">
                        <p className="text-gray-900 font-medium">{item.name}</p>
                        <p className="text-gray-700 text-sm">
                          Quantity: {item.quantity} | Price: ₦{item.price} | Total: ₦{item.total}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 text-right text-gray-900 font-semibold">
                  Grand Total: ₦{order.totalAmount}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}