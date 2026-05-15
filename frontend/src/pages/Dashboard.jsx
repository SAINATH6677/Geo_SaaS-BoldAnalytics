import { useEffect, useState } from 'react'

import api from '../api/axios'
import AdminLayout from '../layouts/AdminLayout'
import DashboardCard from '../components/DashboardCard'

import RequestsChart from '../charts/RequestsChart'
import PlansPieChart from '../charts/PlansPieChart'

function Dashboard() {

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
    return <div>Loading...</div>
  }

  return (
    <AdminLayout>

      <div className="grid grid-cols-4 gap-5 mb-8">

        <DashboardCard
          title="Total Users"
          value={analytics.total_users}
        />

        <DashboardCard
          title="Total Requests"
          value={analytics.total_requests}
        />

        <DashboardCard
          title="Approved Users"
          value={analytics.approved_users}
        />

        <DashboardCard
          title="Avg Response"
          value={`${analytics.average_response_time} ms`}
        />

      </div>

      <div className="grid grid-cols-2 gap-5">

        <RequestsChart />

        <PlansPieChart
          plans={analytics.plans}
        />

      </div>

    </AdminLayout>
  )
}

export default Dashboard