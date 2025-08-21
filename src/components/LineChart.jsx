import React from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Col, Row, Typography } from "antd";

const { Title } = Typography;

// ✅ Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const LineChart = ({ coinHistory, currentPrice, coinName }) => {
  const history = coinHistory?.data?.history || [];

  // ✅ Convert timestamps properly (seconds → ms) & prices to numbers
  const coinPrice = history.map((item) => parseFloat(item.price)).reverse();
  const coinTimestamp = history
    .map((item) => new Date(item.timestamp * 1000)) // multiply by 1000
    .reverse();

  const data = {
    labels: coinTimestamp,
    datasets: [
      {
        label: "Price (USD)",
        data: coinPrice,
        borderColor: "#0071bd",
        backgroundColor: "rgba(0, 113, 189, 0.1)", // ✅ subtle fill
        borderWidth: 2,
        pointRadius: 0, // ✅ remove dots for smoother look
        pointHoverRadius: 4,
        fill: true,
        tension: 0.25, // ✅ nice smooth curve
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // ✅ cleaner look (remove legend if only 1 dataset)
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) =>
            `$${context.parsed.y.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    scales: {
      x: {
        type: "time", // ✅ use time scale
        time: {
          unit: "day", // auto: "day", "hour", etc. (depends on data range)
          tooltipFormat: "PPpp", // full datetime
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
        grid: {
          display: false, // ✅ cleaner chart
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) =>
            `$${value >= 1000 ? value.toLocaleString() : value}`,
        },
        grid: {
          color: "rgba(200, 200, 200, 0.2)", // ✅ subtle grid
        },
      },
    },
  };

  return (
    <>
      <Row className="chart-header">
        <Title level={2} className="chart-title">
          {coinName} Price Chart
        </Title>
        <Col className="price-container">
          <Title level={5} className="price-change">
            Change: {coinHistory?.data?.change}%
          </Title>
          <Title level={5} className="current-price">
            Current {coinName} Price: ${currentPrice}
          </Title>
        </Col>
      </Row>
      <div style={{ height: "400px" }}>
        <Line data={data} options={options} />
      </div>
    </>
  );
};

// ✅ PropTypes
LineChart.propTypes = {
  coinHistory: PropTypes.shape({
    data: PropTypes.shape({
      change: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      history: PropTypes.arrayOf(
        PropTypes.shape({
          price: PropTypes.string,
          timestamp: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
          ]),
        })
      ),
    }),
  }),
  currentPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  coinName: PropTypes.string,
};

export default LineChart;
