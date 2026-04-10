import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import {
  FaSearch,
  FaUserShield,
  FaPlus,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaCalendarAlt,
} from "react-icons/fa";
import { adminAPI } from "../../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const StaffManagement = () => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "moderator",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStaff();
      if (response.data.success) {
        setStaff(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff members");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await adminAPI.createStaff(formData);
      if (response.data.success) {
        toast.success("Staff member created successfully");
        setIsModalOpen(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "moderator",
          phone: "",
        });
        fetchStaff();
      }
    } catch (error) {
      console.error("Error creating staff:", error);
      toast.error(error.response?.data?.message || "Failed to create staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "finance":
        return "bg-green-100 text-green-800 border-green-200";
      case "moderator":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50 font-roboto">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 px-8 py-6 flex justify-between items-center sticky top-0 z-30">
          <div>
            <h1 className="text-3xl font-raleway font-bold text-charcoal">
              Staff Management
            </h1>
            <p className="text-neutral-600 mt-1">
              Manage administrators, finance, and moderator roles
            </p>
          </div>
          
          {currentUser?.role === 'admin' && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all font-bold"
            >
              <FaPlus />
              New Staff
            </Button>
          )}
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Search Bar */}
          <Card className="mb-8 border-none shadow-sm overflow-hidden">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search staff by name or email..."
                className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 text-neutral-700 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Card>

          {/* Staff Table */}
          <Card className="border-none shadow-sm overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-neutral-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Joined Date</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-neutral-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-neutral-500">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="font-medium">Loading staff members...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStaff.length > 0 ? (
                    filteredStaff.map((member) => (
                      <tr key={member.id} className="hover:bg-neutral-50/80 transition-all group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-bold border border-primary/10">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-charcoal">{member.name}</p>
                              <p className="text-xs text-neutral-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${getRoleBadgeColor(member.role)}`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-neutral-500 space-y-1">
                            <p className="flex items-center gap-2"><FaEnvelope className="text-[10px]" /> {member.email}</p>
                            <p className="flex items-center gap-2"><FaPhone className="text-[10px]" /> {member.phone || "No phone"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                            <FaCalendarAlt className="text-neutral-300" />
                            {new Date(member.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block ring-4 ring-green-100" title="Active"></span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-neutral-400">
                        No staff members found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Staff Member"
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="Enter full name"
            required
            value={formData.name}
            onChange={handleInputChange}
          />
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="staff@vadtrans.com"
            required
            value={formData.email}
            onChange={handleInputChange}
            icon={FaEnvelope}
          />
          <Input
            label="Initial Password"
            type="password"
            name="password"
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={handleInputChange}
            icon={FaLock}
          />
          <Input
            label="Phone Number"
            name="phone"
            placeholder="+234..."
            value={formData.phone}
            onChange={handleInputChange}
            icon={FaPhone}
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-neutral-700">Assign Role</label>
            <div className="grid grid-cols-3 gap-3">
              {['admin', 'finance', 'moderator'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: r }))}
                  className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${
                    formData.role === r 
                      ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                      : 'bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-white font-bold px-8 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? "Creating..." : "Create Staff Member"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
