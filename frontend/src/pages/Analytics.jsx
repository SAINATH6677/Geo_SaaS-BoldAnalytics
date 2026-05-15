import { useEffect, useState } from 'react'
import api from '../api/axios'
import AdminLayout from '../layouts/AdminLayout'

function Analytics() {

  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {

    try {

      const res = await api.get('/admin/analytics')

      setAnalytics(res.data.data)

    } catch (err) {
      console.error(err)
    }
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>

      <div className="grid grid-cols-4 gap-5 mb-8">

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-gray-500">
            Total Users
          </h2>

          <p className="text-3xl font-bold mt-2">
            {analytics.total_users}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-gray-500">
            Total Requests
          </h2>

          <p className="text-3xl font-bold mt-2">
            {analytics.total_requests}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-gray-500">
            Approved Users
          </h2>

          <p className="text-3xl font-bold mt-2">
            {analytics.approved_users}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-gray-500">
            Avg Response
          </h2>

          <p className="text-3xl font-bold mt-2">
            {analytics.average_response_time} ms
          </p>
        </div>

      </div>

      <div className="bg-white p-6 rounded shadow">

        <h2 className="text-2xl font-bold mb-5">
          Plan Distribution
        </h2>

        <table className="w-full border">

          <thead>

            <tr className="bg-gray-100">

              <th className="p-3 border text-left">
                Plan
              </th>

              <th className="p-3 border text-left">
                Users
              </th>

            </tr>

          </thead>

          <tbody>

            {analytics.plans.map((plan, index) => (

              <tr key={index}>

                <td className="p-3 border">
                  {plan.plan}
                </td>

                <td className="p-3 border">
                  {plan.count}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </AdminLayout>
  )
}

export default Analytics