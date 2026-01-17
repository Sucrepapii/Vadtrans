import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  FaDollarSign,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBus,
  FaCar,
} from "react-icons/fa";
import { adminAPI } from "../../services/api";
import { toast } from "react-toastify";

const FareManagement = () => {
  const [fares, setFares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFares();
  }, []);

  const fetchFares = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getFares();
      if (response.data.success) {
        setFares(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching fares:", error);
      toast.error("Failed to load fares");
    } finally {
      setLoading(false);
    }
  };

  // Calculate averages from real data
  const calculateAverage = (field) => {
    if (fares.length === 0) return 0;
    const sum = fares.reduce(
      (acc, fare) => acc + (parseFloat(fare[field]) || 0),
      0
    );
    return (sum / fares.length).toFixed(2);
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-neutral-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-raleway font-bold text-charcoal">
                Fare Management
              </h1>
              <p className="text-neutral-600 mt-1">
                Configure pricing for different routes
              </p>
            </div>
            <Button variant="primary">
              <div className="flex items-center gap-2">
                <FaPlus />
                <span>Add Route</span>
              </div>
            </Button>
          </div>
        </div>

        <div className="p-8">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      Route
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      <div className="flex items-center gap-2">
                        <FaDollarSign className="text-green-600" />
                        Bus
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      <div className="flex items-center gap-2">
                        <FaDollarSign className="text-blue-600" />
                        Car
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-neutral-500">
                        Loading fares...
                      </td>
                    </tr>
                  ) : fares.length > 0 ? (
                    fares.map((fare) => (
                      <tr
                        key={fare.id}
                        className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 font-medium">{fare.route}</td>
                        <td className="px-4 py-3 text-sm">
                          ₦{parseFloat(fare.bus || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          ₦{parseFloat(fare.train || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="text"
                              className="text-sm text-blue-600">
                              <FaEdit />
                            </Button>
                            <Button
                              variant="text"
                              className="text-sm text-red-600">
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-8 text-center text-neutral-500">
                        No fares configured yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <h3 className="font-semibold mb-2">Average Bus Fare</h3>
              <p className="text-3xl font-bold text-green-600">
                ₦{calculateAverage("bus")}
              </p>
            </Card>
            <Card>
              <h3 className="font-semibold mb-2">Average Car Fare</h3>
              <p className="text-3xl font-bold text-blue-600">
                ₦{calculateAverage("train")}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FareManagement;
