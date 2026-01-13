import React, { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { FaDollarSign, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const FareManagement = () => {
  const [fares, setFares] = useState([
    { id: 1, route: "Lagos - Abuja", bus: 45, train: 85, flight: 320 },
    { id: 2, route: "Lagos - Port Harcourt", bus: 35, train: 65, flight: 280 },
    { id: 3, route: "Abuja - Kano", bus: 30, train: 55, flight: 250 },
    { id: 4, route: "Lagos - Ibadan", bus: 15, train: 25, flight: 150 },
  ]);

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
                        Train
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      <div className="flex items-center gap-2">
                        <FaDollarSign className="text-purple-600" />
                        Flight
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {fares.map((fare) => (
                    <tr
                      key={fare.id}
                      className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{fare.route}</td>
                      <td className="px-4 py-3 text-sm">₦{fare.bus}</td>
                      <td className="px-4 py-3 text-sm">₦{fare.train}</td>
                      <td className="px-4 py-3 text-sm">₦{fare.flight}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <h3 className="font-semibold mb-2">Average Bus Fare</h3>
              <p className="text-3xl font-bold text-green-600">₦31.25</p>
            </Card>
            <Card>
              <h3 className="font-semibold mb-2">Average Train Fare</h3>
              <p className="text-3xl font-bold text-blue-600">₦57.50</p>
            </Card>
            <Card>
              <h3 className="font-semibold mb-2">Average Flight Fare</h3>
              <p className="text-3xl font-bold text-purple-600">₦250.00</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FareManagement;
