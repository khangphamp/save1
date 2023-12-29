import { useEffect, useState } from 'react'
import { Container } from 'reactstrap'
import BreadCrumb from '../../common/BreadCrumb'
import { getCountClickLive } from '../../helpers/helper'
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Button, Col, Form, Input, Select } from 'antd/lib';
import { Option } from 'antd/lib/mentions';

const listType = [
  {
    label: 'Ngày',
    value: 1,
  },
  {
    label: 'Tuần',
    value: 2,
  },
  {
    label: 'Tháng',
    value: 3,
  },
  {
    label: 'Năm',
    value: 4,
  },
]

const currentDate = new Date();
const year = currentDate.getFullYear();
const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
const day = currentDate.getDate().toString().padStart(2, '0');
const formattedDate = `${year}-${month}-${day}`;

function DashboardAnalytics() {
  const [dataCount, setDataCount]  = useState([]);
  const [toDay, setToDay] = useState(null);
  const [fromDay, setFromDay] = useState(null);
  const [dataDay, setDataDay] = useState({});
  const [typeValue, setTypeValue] = useState(1)

  useEffect(() => {
    getCountClickLive().then(res => {
      if(res){
        setDataCount(res);
        setFromDay(formattedDate)
        setToDay(formattedDate);
        handleSearch(formattedDate, formattedDate, res)
      }
    })
  },[])

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart tính số lần user click btn live',
      },
    },
    scales: {
      y: {
          ticks: {
              precision: 0
          },
      }
    },
  };
  
  const labels = [];
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Số lần (ngày, tháng, năm ko hiện mặc định là bằng 0)',
        data: dataDay,
        backgroundColor: 'rgba(64, 169, 255, 0.5)',
      },
    ],
  };
  const handleSearch = (to, from, data) => {
    // if(!toDay || !fromDay) return;
    const newData = JSON.parse(JSON.stringify(data || dataCount));
    const countByDate = {};
    const startDate = new Date(toDay || to);
    let endDate = new Date(fromDay || from)
    endDate.setDate(endDate.getDate() + 1)
    if(typeValue == 1){
      newData.forEach(entry => {
        const createdAtDate = new Date(entry.createdAt);
        if (createdAtDate >= startDate && createdAtDate <= endDate) {
            const dateKey = createdAtDate.toISOString().split('T')[0];
            countByDate[dateKey] = (countByDate[dateKey] || 0) + entry.count;
        }
      });
      setDataDay(countByDate)
    }else if(typeValue == 2) {
        const countByWeek = {};
        newData.forEach(entry => {
            const createdAtDate = new Date(entry.createdAt);

            if (createdAtDate >= startDate && createdAtDate <= endDate) {
                const weekStartDate = new Date(createdAtDate);
                weekStartDate.setDate(weekStartDate.getDate() - (weekStartDate.getDay() + 6) % 7); // Set to the start of the week
                const weekEndDate = new Date(weekStartDate);
                weekEndDate.setDate(weekEndDate.getDate() + 6); // Set to Sunday
                const weekKey = `${weekStartDate.toISOString().split('T')[0]} => ${weekEndDate.toISOString().split('T')[0]}`;
                console.log(weekKey)
                countByWeek[weekKey] = (countByWeek[weekKey] || 0) + entry.count;
            }
        });
        setDataDay(countByWeek)
    }else if(typeValue == 3){
      const countByMonth = {};
      newData.forEach(entry => {
          const createdAtDate = new Date(entry.createdAt);
      
          if (createdAtDate >= startDate && createdAtDate <= endDate) {
              const monthKey = `${createdAtDate.getFullYear()}-${(createdAtDate.getMonth() + 1).toString().padStart(2, '0')}`;
              countByMonth[monthKey] = (countByMonth[monthKey] || 0) + entry.count;
          }
      });
      setDataDay(countByMonth)
    }else {
      const countByYear = {};
        newData.forEach(entry => {
            const createdAtDate = new Date(entry.createdAt);

            if (createdAtDate >= startDate && createdAtDate <= endDate) {
                const yearKey = createdAtDate.getFullYear().toString();
                countByYear[yearKey] = (countByYear[yearKey] || 0) + entry.count;
            }
        });
      setDataDay(countByYear)
    }

    
  }
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Dashboard" pageTitle="dashboard" />
          <Form
            layout="vertical"
            autoComplete="off"
          >
          <Col style={{display: "flex", alignItems: "center", gap: 20}}>
            <Form.Item name="to_day" label="Ngày bắt đầu">
              <Input
                  placeholder="Enter post name"
                  name="to_day"
                  defaultValue={formattedDate}
                  onChange={(e) => setToDay(e.target.value)}
                  type="date"
                  min="2022-01-01" max="2030-12-31"
                />
            </Form.Item>
            <Form.Item name="from_day" label="Ngày kết thúc">
              <Input
                  placeholder="Enter post name"
                  name="from_day"
                  defaultValue={formattedDate}
                  onChange={(e) => setFromDay(e.target.value)}
                  type="date"
                  min="2022-01-01" max="2030-12-31"
                />
            </Form.Item>
            <Form.Item name="type" label="Loại">
              <Select
                name="type"
                defaultValue={typeValue}
                onChange={(v) => setTypeValue(v)}
              >
                {listType.length > 0 &&
                  listType.map((item) => {
                    return (
                      <Select.Option key={item.value} value={item.value}>
                        {item.label}
                      </Select.Option>
                    );
                  })}
              </Select>
            </Form.Item>
        
            <Button
              type="primary"
              htmlType="button"
              onClick={() => handleSearch()}
            >
              Lọc
            </Button>

          </Col>
          </Form>
          <Bar height={100} options={options} data={data} />
        </Container>
      </div>
    </React.Fragment>
  )
}

export default DashboardAnalytics