import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts'

function RequestsChart() {

  const data = [
    { day: 'Mon', requests: 120 },
    { day: 'Tue', requests: 300 },
    { day: 'Wed', requests: 500 },
    { day: 'Thu', requests: 200 },
    { day: 'Fri', requests: 700 }
  ]

  return (
    <div className="bg-white p-5 rounded shadow h-96">

      <h2 className="font-bold mb-5">
        API Requests
      </h2>

      <ResponsiveContainer width="100%" height="100%">

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="requests"
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  )
}

export default RequestsChart