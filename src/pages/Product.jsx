import React, { useState, useEffect } from "react";
import Sidebar from "../componenets/Sidebar";
import { 
  HiOutlinePencilAlt, 
  HiOutlineTrash, 
  HiPlus, 
  HiExclamation,
  HiX 
} from "react-icons/hi";
import { db, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "../hooks/firebase"

/* ================= IMG UPLOAD ================= */
const uploadImageToImgBB = async (imageFile) => {
  if (!imageFile) return null;
  const formData = new FormData();
  formData.append("image", imageFile);
  const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY;;

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return data?.data?.url || null;
};

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // New loading states for actions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    image: null,
    section: "", // "farmInput" or "farmProduce"
    category: "", // Based on section selection
  });

  const productsCollection = collection(db, "products");

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(productsCollection);
      const prods = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
      setProducts(prods);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= MODALS ================= */
  const openAddModal = () => {
    setCurrentProduct(null);
    setFormData({
      name: "",
      price: "",
      quantity: "",
      description: "",
      image: null,
      section: "",
      category: "",
    });
    setIsFormOpen(true);
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      quantity: product.stock,
      description: product.description,
      image: null,
      section: product.section || "",
      category: product.category || "",
    });
    setIsFormOpen(true);
  };

  const openDeleteModal = (product) => {
    setCurrentProduct(product);
    setIsDeleteOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setError("");
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true); // Start submitting state

    // Validate section and category
    if (!formData.section || !formData.category) {
      setError("Please select both section and category");
      setIsSubmitting(false); // Stop submitting on error
      return;
    }

    try {
      // 1️⃣ Upload image if selected
      let imageUrl = currentProduct?.image?.url || null;
      if (formData.image) {
        imageUrl = await uploadImageToImgBB(formData.image);
      }

      // 2️⃣ Prepare product data
      const data = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.quantity),
        description: formData.description,
        image: { url: imageUrl },
        section: formData.section,
        category: formData.category,
        createdAt: serverTimestamp(),
        totalSold: currentProduct?.totalSold || 0,
      };

      if (currentProduct) {
        const prodRef = doc(db, "products", currentProduct._id);
        await updateDoc(prodRef, data);
      } else {
        await addDoc(productsCollection, data);
      }

      closeModal();
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError("Action failed");
    } finally {
      setIsSubmitting(false); // End submitting state
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    setIsDeleting(true); // Start deleting state
    try {
      const prodRef = doc(db, "products", currentProduct._id);
      await deleteDoc(prodRef); // Use deleteDoc for permanent deletion
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError("Delete failed");
    } finally {
      setIsDeleting(false); // End deleting state
    }
  };

  // Updated categories based on section
  const farmInputCategories = ["Machinery", "Equipment", "Chemical", "Seedlings", "Medicine"];
  const farmProduceCategories = ["Grains", "Tubers", "Livestock", "Vegetables"];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 pt-20 md:pt-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-gray-500">Manage your inventory visually</p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition text-white px-5 py-2.5 rounded-xl shadow"
          >
            <HiPlus /> Add Product
          </button>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* PRODUCTS GRID */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-200 rounded-full p-4 mb-4">
              <HiExclamation className="text-gray-500 text-3xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 text-center max-w-md">
              You haven't added any products yet. Click the "Add Product" button to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden relative group"
              >
                {/* IMAGE */}
                <div className="h-44 overflow-hidden">
                  {p.image?.url ? (
                    <img
                      src={p.image.url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="bg-gray-200 h-full flex items-center justify-center">
                      No Image
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-4 flex flex-col justify-between h-[180px]">
                  <div>
                    <h3 className="font-semibold text-lg">{p.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {p.section === "farmInput" ? "Farm Input" : "Farm Produce"} • {p.category}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-green-700 font-bold text-lg">
                      ₦{p.price}
                    </span>
                    <span className="text-xs text-gray-500">{p.stock} units</span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 bg-white rounded-lg shadow"
                  >
                    <HiOutlinePencilAlt className="text-green-600" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(p)}
                    className="p-2 bg-white rounded-lg shadow"
                  >
                    <HiOutlineTrash className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-4 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {currentProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button 
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <HiX className="text-xl text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                className="input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Product name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  className="input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Price per unit"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
                <input
                  required
                  type="number"
                  className="input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Total units"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  required
                  className="input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.section}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      section: e.target.value, 
                      category: "" 
                    });
                  }}
                >
                  <option value="">Select Section</option>
                  <option value="farmInput">Farm Input</option>
                  <option value="farmProduce">Farm Produce</option>
                </select>
              </div>

              {formData.section && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    required
                    className="input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="">Select Category</option>
                    {(formData.section === "farmInput" ? farmInputCategories : farmProduceCategories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              <textarea
                rows={3}
                className="input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.files[0] })
                  }
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl text-center max-w-sm w-full">
            <HiExclamation className="mx-auto text-red-600 text-4xl mb-2" />
            <p className="mb-4 font-medium">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 border py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}