import React from 'react';
import millify from 'millify';
import { Collapse, Row, Col, Typography, Avatar } from 'antd';
import HTMLReactParser from 'html-react-parser';

import { useGetExchangesQuery } from '../services/cryptoApi';
import Loader from './Loader';
import mockExchanges from '../data/exchanges.json'; // ✅ import fake JSON

const { Text } = Typography;
const { Panel } = Collapse;

const Exchanges = () => {
  const { data, isFetching } = useGetExchangesQuery();

  // Use API if available, otherwise fallback to local JSON
  const exchangesList = data?.data?.exchanges || mockExchanges;

  if (isFetching) return <Loader />;

  return (
    <>
      <Row>
        <Col span={6}><strong>Exchanges</strong></Col>
        <Col span={6}><strong>24h Trade Volume</strong></Col>
        <Col span={6}><strong>Markets</strong></Col>
        <Col span={6}><strong>Change</strong></Col>
      </Row>
      <Row>
        {exchangesList.map((exchange) => (
          <Col span={24} key={exchange.uuid}>
            <Collapse>
              <Panel
                showArrow={false}
                header={(
                  <Row>
                    <Col span={6}>
                      <Text><strong>{exchange.rank}.</strong></Text>
                      <Avatar className="exchange-image" src={exchange.iconUrl} />
                      <Text><strong>{exchange.name}</strong></Text>
                    </Col>
                    <Col span={6}>${millify(exchange.volume)}</Col>
                    <Col span={6}>{millify(exchange.numberOfMarkets)}</Col>
                    <Col span={6}>{millify(exchange.marketShare)}%</Col>
                  </Row>
                )}
              >
                {HTMLReactParser(exchange.description || '')}
              </Panel>
            </Collapse>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Exchanges;
