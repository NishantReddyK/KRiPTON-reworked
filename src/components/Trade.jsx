import React, { useState, useEffect } from "react";
import { Select, Input, Button, Typography, Row, Col, Card, message } from "antd";
import { useGetCryptosQuery } from "../services/cryptoApi";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

const { Option } = Select;
const { Title, Text } = Typography;

const Trade = () => {
  const { data: cryptosList, isFetching } = useGetCryptosQuery(100);
  const [selectedCoin, setSelectedCoin] = useState("");
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState("buy");
  const [portfolio, setPortfolio] = useState({ cash: 10000, holdings: {} });
  const [loading, setLoading] = useState(false);
  const [portfolioHistory, setPortfolioHistory] = useState([
    { time: "Start", value: 10000 },
  ]);

  // Load portfolio from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("portfolio");
    if (saved) setPortfolio(JSON.parse(saved));
  }, []);

  // Persist portfolio in localStorage
  useEffect(() => {
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
  }, [portfolio]);

  if (isFetching) return <div>Loading cryptos...</div>;

  const calculatePortfolioValue = (currentPortfolio) => {
    const holdingsValue = Object.entries(currentPortfolio.holdings).reduce(
      (sum, [coinId, amt]) => {
        const coin = cryptosList.data.coins.find((c) => c.uuid === coinId);
        const price = coin ? parseFloat(coin.price) : 0;
        return sum + amt * price;
      },
      0
    );
    return currentPortfolio.cash + holdingsValue;
  };

  const handleTrade = async () => {
    if (!selectedCoin || !amount) return message.error("Select coin and enter amount");

    const coin = cryptosList.data.coins.find((c) => c.uuid === selectedCoin);
    if (!coin) return message.error("Coin not found");

    const price = parseFloat(coin.price) || 0;
    const amt = parseFloat(amount);
    if (!price) return message.error("Price not available");
    if (isNaN(amt) || amt <= 0) return message.error("Enter a valid amount");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinId: selectedCoin, action, amount: amt, price }),
      });
      const data = await res.json();

      if (res.ok) {
        setPortfolio(data.portfolio);

        // Update portfolio history
        const totalValue = calculatePortfolioValue(data.portfolio);
        setPortfolioHistory((prev) => [
          ...prev,
          { time: new Date().toLocaleTimeString(), value: totalValue },
        ]);

        message.success(`${action.toUpperCase()} successful!`);
      } else {
        message.error(data.error || "Trade failed");
      }
    } catch (err) {
      console.error(err);
      message.error("Trade failed due to server error");
    }
    setLoading(false);
  };

  // Chart.js data
  const lineChartData = {
    labels: portfolioHistory.map((p) => p.time),
    datasets: [
      {
        label: "Portfolio Value ($)",
        data: portfolioHistory.map((p) => p.value),
        borderColor: "#8884d8",
        backgroundColor: "rgba(136, 132, 216, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const pieChartData = {
    labels: Object.entries(portfolio.holdings).map(([coinId]) => {
      const coin = cryptosList.data.coins.find((c) => c.uuid === coinId);
      return coin ? coin.name : coinId;
    }),
    datasets: [
      {
        data: Object.entries(portfolio.holdings).map(([coinId, amt]) => {
          const coin = cryptosList.data.coins.find((c) => c.uuid === coinId);
          const price = coin ? parseFloat(coin.price) : 0;
          return amt * price;
        }),
        backgroundColor: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#FF6699"],
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Crypto Trade Simulator</Title>

      {/* Trade Inputs */}
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col>
          <Select
            style={{ width: 200 }}
            placeholder="Select Crypto"
            onChange={setSelectedCoin}
            value={selectedCoin || undefined}
          >
            {cryptosList.data.coins.map((c) => (
              <Option key={c.uuid} value={c.uuid}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col>
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: 150 }}
          />
        </Col>

        <Col>
          <Select value={action} onChange={setAction} style={{ width: 100 }}>
            <Option value="buy">Buy</Option>
            <Option value="sell">Sell</Option>
          </Select>
        </Col>

        <Col>
          <Button type="primary" onClick={handleTrade} loading={loading}>
            Execute
          </Button>
        </Col>
      </Row>

      {/* Portfolio Overview */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Portfolio Overview">
            <Text strong>Cash: </Text>${portfolio.cash.toFixed(2)}
            <br />
            <Text strong>Holdings:</Text>
            <ul>
              {Object.entries(portfolio.holdings).map(([coin, amt]) => (
                <li key={coin}>
                  {cryptosList.data.coins.find((c) => c.uuid === coin)?.name || coin}: {amt}
                </li>
              ))}
              {Object.keys(portfolio.holdings).length === 0 && <li>None</li>}
            </ul>
          </Card>
        </Col>
      </Row>

      {/* Charts Side by Side */}
      <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
        <Col xs={24} md={12}>
          <Card className='profit-loss-graph' title="Portfolio Value Over Time">
            <Line data={lineChartData} options={{ responsive: true }} />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card className='distribution-' title="Holdings Distribution">
            <Pie data={pieChartData} options={{ responsive: true }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Trade;
