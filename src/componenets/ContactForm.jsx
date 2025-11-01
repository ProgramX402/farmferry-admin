import { useState } from "react";
import axios from "axios";

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [response, setResponse] = useState({ text: "", isError: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse({ text: "", isError: false });

    try {
      const res = await axios.post("https://orphanage-backend-r7i2.onrender.com/api/contact", form);
      setResponse({ text: res.data.message, isError: false });
      setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    } catch (err) {
      setResponse({
        text: err.response?.data?.error || "Something went wrong",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Contact Us</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          className="p-2 border rounded w-full mb-3"
          required
        />

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          className="p-2 border rounded w-full mb-3"
          required
        />

        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          rows="4"
          className="p-2 border rounded w-full mb-3"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>

        {response.text && (
          <p
            className={`mt-3 text-center ${
              response.isError ? "text-red-600" : "text-green-600"
            }`}
          >
            {response.text}
          </p>
        )}
      </form>
    </div>
  );
}
