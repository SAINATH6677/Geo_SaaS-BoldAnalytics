import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

function PlansPieChart({ plans }) {

  const data = plans.map((item) => ({
    name: item.plan,
    value: Number(item.count)
  }))

  return (
    <div className="bg-white p-5 rounded shadow h-96">

      <h2 className="font-bold mb-5">
        Plan Distribution
      </h2>

      <ResponsiveContainer width="100%" height="100%">

        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          />

          <Tooltip />

        </PieChart>

      </ResponsiveContainer>

    </div>
  )
}

export default PlansPieChart