import React, { useState } from 'react';
import HTMLReactParser from 'html-react-parser';
import { useParams } from 'react-router-dom';
import millify from 'millify';
import { Col, Row, Typography, Select } from 'antd';
import { 
  MoneyCollectOutlined, DollarCircleOutlined, FundOutlined, 
  ExclamationCircleOutlined, StopOutlined, TrophyOutlined, 
  CheckOutlined, NumberOutlined, ThunderboltOutlined 
} from '@ant-design/icons';

import { useGetCryptoDetailsQuery, useGetCryptoHistoryQuery } from '../services/cryptoApi';
import Loader from './Loader';
import LineChart from './LineChart';

const { Title, Text } = Typography;
const { Option } = Select;

const CryptoDetails = () => {
  const { coinId } = useParams();
  const [timeperiod, setTimeperiod] = useState('7d');

  const { data: coinData, isFetching } = useGetCryptoDetailsQuery(coinId);
  const { data: coinHistory } = useGetCryptoHistoryQuery({ coinId, timeperiod });

  const cryptoDetails = coinData?.data?.coin;

  if (isFetching) return <Loader />;

  const timeOptions = ['3h', '24h', '7d', '30d', '1y', '3m', '3y', '5y'];

  const stats = [
    { title: 'Price to USD', value: `$ ${cryptoDetails?.price ? millify(cryptoDetails.price) : 'N/A'}`, icon: <DollarCircleOutlined /> },
    { title: 'Rank', value: cryptoDetails?.rank || 'N/A', icon: <NumberOutlined /> },
    { title: '24h Volume', value: `$ ${cryptoDetails?.volume ? millify(cryptoDetails.volume) : 'N/A'}`, icon: <ThunderboltOutlined /> },
    { title: 'Market Cap', value: `$ ${cryptoDetails?.marketCap ? millify(cryptoDetails.marketCap) : 'N/A'}`, icon: <DollarCircleOutlined /> },
    { title: 'All-time-high (daily avg.)', value: `$ ${cryptoDetails?.allTimeHigh?.price ? millify(cryptoDetails.allTimeHigh.price) : 'N/A'}`, icon: <TrophyOutlined /> },
  ];

  const genericStats = [
    { title: 'Number Of Markets', value: cryptoDetails?.numberOfMarkets || 'N/A', icon: <FundOutlined /> },
    { title: 'Number Of Exchanges', value: cryptoDetails?.numberOfExchanges || 'N/A', icon: <MoneyCollectOutlined /> },
    { title: 'Approved Supply', value: cryptoDetails?.supply?.confirmed ? <CheckOutlined /> : <StopOutlined />, icon: <ExclamationCircleOutlined /> },
    { title: 'Total Supply', value: `$ ${cryptoDetails?.supply?.total ? millify(cryptoDetails.supply.total) : 'N/A'}`, icon: <ExclamationCircleOutlined /> },
    { title: 'Circulating Supply', value: `$ ${cryptoDetails?.supply?.circulating ? millify(cryptoDetails.supply.circulating) : 'N/A'}`, icon: <ExclamationCircleOutlined /> },
  ];

  return (
    <Col className="coin-detail-container">
      {/* Header */}
      <Col className="coin-heading-container">
        <Title level={2} className="coin-name">
          {cryptoDetails?.name} ({cryptoDetails?.symbol}) Price
        </Title>
        <p>
          {cryptoDetails?.name} live price in US Dollar (USD). 
          View value statistics, market cap and supply.
        </p>
      </Col>

      {/* Time Period Selector */}
      <Select 
        defaultValue="7d" 
        className="select-timeperiod"
        onChange={(value) => setTimeperiod(value)}
      >
        {timeOptions.map((date) => (
          <Option key={date} value={date}>{date}</Option>
        ))}
      </Select>

      {/* Line Chart */}
      <LineChart 
        coinHistory={coinHistory} 
        currentPrice={millify(cryptoDetails?.price || 0)} 
        coinName={cryptoDetails?.name || ''} 
      />

      {/* Stats Section */}
      <Col className="stats-container">
        {/* Value Stats */}
        <Col className="coin-value-statistics">
          <Col className="coin-value-statistics-heading">
            <Title level={3} className="coin-details-heading">{cryptoDetails?.name} Value Statistics</Title>
            <p>An overview showing statistics such as base/quote currency, rank, and trading volume.</p>
          </Col>
          {stats.map(({ title, value, icon }) => (
            <Col className="coin-stats" key={title}>
              <Col className="coin-stats-name">
                <Text>{icon}</Text>
                <Text>{title}</Text>
              </Col>
              <Text className="stats">{value}</Text>
            </Col>
          ))}
        </Col>

        {/* Generic Stats */}
        <Col className="other-stats-info">
          <Col className="coin-value-statistics-heading">
            <Title level={3} className="coin-details-heading">Other Stats Info</Title>
            <p>Additional stats including supply and exchange data.</p>
          </Col>
          {genericStats.map(({ title, value, icon }) => (
            <Col className="coin-stats" key={title}>
              <Col className="coin-stats-name">
                <Text>{icon}</Text>
                <Text>{title}</Text>
              </Col>
              <Text className="stats">{value}</Text>
            </Col>
          ))}
        </Col>
      </Col>

      {/* Description & Links */}
      <Col className="coin-desc-link">
        <Row className="coin-desc">
          <Title level={3} className="coin-details-heading">What is {cryptoDetails?.name}?</Title>
          {cryptoDetails?.description && HTMLReactParser(cryptoDetails.description)}
        </Row>
        <Col className="coin-links">
          <Title level={3} className="coin-details-heading">{cryptoDetails?.name} Links</Title>
          {cryptoDetails?.links?.map((link) => (
            <Row className="coin-link" key={link.name}>
              <Title level={5} className="link-name">{link.type}</Title>
              <a href={link.url} target="_blank" rel="noreferrer">{link.name}</a>
            </Row>
          ))}
        </Col>
      </Col>
    </Col>
  );
};

export default CryptoDetails;
