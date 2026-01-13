import React, { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { FaPlus, FaEdit, FaTrash, FaQuestionCircle } from "react-icons/fa";

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([
    {
      id: 1,
      category: "Booking",
      question: "How do I book a ticket?",
      answer:
        "To book a ticket, search for your desired route, select a trip, enter passenger details, and proceed to payment.",
    },
    {
      id: 2,
      category: "Payment",
      question: "What payment methods are accepted?",
      answer:
        "We accept credit/debit cards, PayPal, and direct bank transfers.",
    },
    {
      id: 3,
      category: "Cancellation",
      question: "Can I cancel my booking?",
      answer:
        "Yes, you can cancel your booking up to 24 hours before departure for a full refund.",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    question: "",
    answer: "",
  });

  const categories = [
    "Booking",
    "Payment",
    "Cancellation",
    "General",
    "Account",
  ];

  const handleAdd = () => {
    setEditingFaq(null);
    setFormData({ category: "", question: "", answer: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      setFaqs(faqs.filter((f) => f.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingFaq) {
      setFaqs(
        faqs.map((f) => (f.id === editingFaq.id ? { ...f, ...formData } : f))
      );
    } else {
      setFaqs([...faqs, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-neutral-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-raleway font-bold text-charcoal">
                FAQ Management
              </h1>
              <p className="text-neutral-600 mt-1">
                Manage frequently asked questions
              </p>
            </div>
            <Button variant="primary" onClick={handleAdd}>
              <div className="flex items-center gap-2">
                <FaPlus />
                <span>Add FAQ</span>
              </div>
            </Button>
          </div>
        </div>

        <div className="p-8">
          {categories.map((category) => {
            const categoryFaqs = faqs.filter((f) => f.category === category);
            if (categoryFaqs.length === 0) return null;

            return (
              <div key={category} className="mb-6">
                <h2 className="text-xl font-bold text-charcoal mb-4">
                  {category}
                </h2>
                <div className="space-y-3">
                  {categoryFaqs.map((faq) => (
                    <Card key={faq.id}>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <FaQuestionCircle className="text-2xl text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-charcoal mb-2">
                            {faq.question}
                          </h3>
                          <p className="text-neutral-600 text-sm">
                            {faq.answer}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="text"
                            onClick={() => handleEdit(faq)}
                            className="text-blue-600">
                            <FaEdit />
                          </Button>
                          <Button
                            variant="text"
                            onClick={() => handleDelete(faq.id)}
                            className="text-red-600">
                            <FaTrash />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaq ? "Edit FAQ" : "Add New FAQ"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingFaq ? "Update" : "Create"}
            </Button>
          </>
        }>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required>
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Question"
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            placeholder="Enter the question"
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Answer
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              rows="4"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter the answer"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FAQManagement;
