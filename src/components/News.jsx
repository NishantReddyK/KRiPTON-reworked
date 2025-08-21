import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Select, Typography, Row, Col, Avatar, Card } from 'antd';
import moment from 'moment';

import { useGetCryptosQuery } from '../services/cryptoApi';
import { useGetCryptoNewsQuery } from '../services/cryptoNewsApi';
import Loader from './Loader';

const demoImage = 'https://via.placeholder.com/150';
const { Text, Title } = Typography;
const { Option } = Select;

const News = ({ simplified }) => {
  const [newsCategory, setNewsCategory] = useState('Cryptocurrency');

  const { data: cryptosList } = useGetCryptosQuery(100);
  const { data: cryptoNews, isFetching, isError, error } = useGetCryptoNewsQuery({
    newsCategory,
    count: simplified ? 4 : 12,
  });

  if (isFetching) return <Loader />;

  if (isError) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Title level={4} type="danger">
          Failed to fetch news
        </Title>
        <Text>{error?.data?.message || 'Something went wrong.'}</Text>
      </div>
    );
  }

  if (!cryptoNews?.articles?.length) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Title level={4}>No news found</Title>
      </div>
    );
  }

  return (
    <Row gutter={[24, 24]}>
      {!simplified && (
        <Col span={24}>
          <Select
            showSearch
            className="select-news"
            placeholder="Select a Crypto"
            optionFilterProp="children"
            onChange={(value) => setNewsCategory(value)}
            filterOption={(input, option) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option value="Cryptocurrency">Cryptocurrency</Option>
            {cryptosList?.data?.coins?.map((currency) => (
              <Option key={currency.uuid} value={currency.name}>
                {currency.name}
              </Option>
            ))}
          </Select>
        </Col>
      )}

      {cryptoNews.articles.map((news, i) => (
        <Col xs={12} sm={12} lg={12} key={i}>
          <Card hoverable className="news-card">
            <a href={news.url} target="_blank" rel="noreferrer">
              <div className="news-image-container">
                <Title className="news-title" level={4}>
                  {news.title}
                </Title>
                <img
                  style={{ maxHeight: '120px', objectFit: 'cover' }}
                  src={news.urlToImage || demoImage}
                  alt={news.title}
                />
              </div>
              <p>
                {news.description?.length > 100
                  ? `${news.description.substring(0, 100)}...`
                  : news.description}
              </p>
              <div className="provider-container">
                <div>
                  <Avatar src={demoImage} alt={news.source.name} />
                  <Text className="provider-name">{news.source.name}</Text>
                </div>
                <Text>{moment(news.publishedAt).startOf('ss').fromNow()}</Text>
              </div>
            </a>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

News.propTypes = {
  simplified: PropTypes.bool,
};

export default News;
