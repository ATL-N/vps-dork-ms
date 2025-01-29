import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"; // Assuming you're using Recharts

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8047"]; // Replace with your desired colors

const GradeDistributionChart = ({
  data,
  valueKey,
  labelKey,
  title = "Distribution",
}) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4 text-cyan-700">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey={valueKey}
            label={({ [labelKey]: label }) => `${label}`} // Destructure labelKey
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GradeDistributionChart;
