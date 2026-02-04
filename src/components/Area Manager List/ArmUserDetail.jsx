import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ArmUserDetail = () => {
  const { id } = useParams();
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cashData, setCashData] = useState([]);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token not found");
        setLoading(false);
        return;
      }

      try {
        // Fetch user
        const userRes = await axios.get(`${BASE_URL}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDetail(userRes.data);

        // Decide API
        const apiUrl =
          userRes.data.role === "OT"
            ? `${BASE_URL}/api/cashRecieve/submittedBy/${id}`
            : `${BASE_URL}/api/cash-collection/user/${id}`;

        // Fetch cash records
        const cashRes = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ RAW CASH DATA:", cashRes.data);

        // ✅ FORCE ARRAY (important fix)
        const finalData = Array.isArray(cashRes.data)
          ? cashRes.data
          : cashRes.data?.data || [];

        setCashData(finalData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;

  // ✅ Detect OT structure by field existence
  const isOTData = cashData.length > 0 && "amountPaid" in cashData[0];

  return (
    <div className="text-white p-6">
      <button
        onClick={() => setShowModal(true)}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        View Cash Collection Details
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex bg-black/50">
          <div
            className="fixed inset-0"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="ml-auto w-full max-w-4xl bg-white text-black h-full shadow-lg p-6 relative overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Cash Collection Details ({userDetail?.role})
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-gray-800 text-xl"
              >
                ✕
              </button>
            </div>

            {cashData.length === 0 && (
              <p className="text-red-500 text-center">
                No cash data found (API returned empty)
              </p>
            )}

            {cashData.length > 0 && (
              <div className="overflow-x-auto">
                {/* ================= OT TABLE ================= */}
                {isOTData ? (
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border px-4 py-2">Submitted By</th>
                        <th className="border px-4 py-2">Submitted To</th>
                        <th className="border px-4 py-2">Amount</th>
                        <th className="border px-4 py-2">Date</th>
                        <th className="border px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashData.map((entry) => (
                        <tr key={entry.id}>
                          <td className="border px-4 py-2">
                            {entry.submittedBy?.name || "-"}
                          </td>
                          <td className="border px-4 py-2">
                            {entry.submittedTo?.name || "-"}
                          </td>
                          <td className="border px-4 py-2">
                            ₹ {entry.amountPaid?.toLocaleString()}
                          </td>
                          <td className="border px-4 py-2">
                            {new Date(entry.dateSubmitted).toLocaleString()}
                          </td>
                          <td className="border px-4 py-2">
                            {entry.isVerified ? (
                              <span className="text-green-600 font-bold">
                                Verified
                              </span>
                            ) : (
                              <span className="text-orange-600 font-bold">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  /* ============== ARM TABLE ================= */
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border px-4 py-2">Centre ID</th>
                        <th className="border px-4 py-2">Centre Name</th>
                        <th className="border px-4 py-2">Branch</th>
                        <th className="border px-4 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashData.map((entry) => (
                        <tr key={entry.id}>
                          <td className="border px-4 py-2">
                            {entry.centreId?.centreId || "-"}
                          </td>
                          <td className="border px-4 py-2">
                            {entry.centreId?.name || "-"}
                          </td>
                          <td className="border px-4 py-2">
                            {entry.branchId || "-"}
                          </td>
                          <td className="border px-4 py-2">
                            ₹ {entry.amountReceived?.toLocaleString() || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArmUserDetail;
