import { useEffect, useState } from 'react'
import api from '../api/axios'
import AdminLayout from '../layouts/AdminLayout'

function Logs() {

  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {

    try {

      const res = await api.get('/admin/logs')

      console.log(res.data)

      setLogs(res.data.data)

    } catch (err) {

      console.error(err)
    }
  }

  return (
    <AdminLayout>

      <div className="bg-white p-6 rounded shadow">

        <h1 className="text-3xl font-bold mb-6">
          API Logs
        </h1>

        <div className="overflow-x-auto">

          <table className="w-full border border-gray-200">

            <thead>

              <tr className="bg-gray-100 text-left">

                <th className="p-3 border">
                  Endpoint
                </th>

                <th className="p-3 border">
                  Method
                </th>

                <th className="p-3 border">
                  Status
                </th>

                <th className="p-3 border">
                  Response Time
                </th>

                <th className="p-3 border">
                  Company
                </th>

                <th className="p-3 border">
                  Plan
                </th>

                <th className="p-3 border">
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              {
                logs.map((log) => (

                  <tr
                    key={log.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="p-3 border">
                      {log.endpoint}
                    </td>

                    <td className="p-3 border">
                      {log.method}
                    </td>

                    <td className="p-3 border">
                      {log.status_code}
                    </td>

                    <td className="p-3 border">
                      {log.response_time} ms
                    </td>

                    <td className="p-3 border">
                      {log.company_name || 'N/A'}
                    </td>

                    <td className="p-3 border">
                      {log.plan || 'N/A'}
                    </td>

                    <td className="p-3 border">
                      {
                        new Date(log.created_at)
                          .toLocaleString()
                      }
                    </td>

                  </tr>
                ))
              }

            </tbody>

          </table>

        </div>

      </div>

    </AdminLayout>
  )
}

export default Logs