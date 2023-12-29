/* eslint-disable no-debugger */
import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../common/BreadCrumb";
import {
  Input,
  Button,
  Form,
  message,
  Space,
  Table,
  Tooltip,
  Tag,
  Image,
  Badge,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  FundViewOutlined
} from "@ant-design/icons";

import {
  getPagingPostsV2,
  deletePosts,
  getAllCategory,
} from "../../helpers/helper";
import { Link } from "react-router-dom";
import toSlug from "../../common/function";
const { Option } = Select;

const convertHtmlText = (htmlText) => {
  if (htmlText && htmlText.length > 0) {
    let strText =
      new DOMParser().parseFromString(htmlText, "text/html").documentElement
        .textContent || "";
    if (strText && strText.length > 50) {
      strText = strText.slice(0, 50) + "...";
    }
    return strText;
  }
  return "";
};

const getAllPagingPostsV2 = async (_params) => {
  const params = _params ? _params : {};
  const dataRes = await getPagingPostsV2(params);
  const dataListPost =
    dataRes?.data &&
    dataRes?.data.length > 0 &&
    dataRes?.data.map((item) => {
      return {
        key: item._id,
        title: item.title,
        slug: item.slug,
        category: item.category,
        tags: item.tags,
        description: item.description,
        thumb: item.thumb,
        content: item.content,
        status: item.status,
        numberOfReader: item.numberOfReader,
      };
    });
  return dataRes?.data ? dataListPost : [];
};

const Posts = () => {
  document.title = "Management Posts";
  const [formSearch] = Form.useForm();
  const [listPost, setListPost] = useState([]);
  const [postName, setPostName] = useState("");
  const [listCategory, setListCategory] = useState([]);
  const [listPostSearch, setListPostSearch] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const resListPost = await getAllPagingPostsV2({ pageSize: 100000 });
      const resListCategory = await getAllCategory({ pageSize: 100000 });
      setListCategory(resListCategory.data);
      setListPost(resListPost);
    };

    fetchData();
  }, []);

  useEffect(() => {
    setListPostSearch(listPost)
  },[listPost])
  const handleRefresh = async () => {
    const dataRes = await getAllPagingPostsV2({ pageSize: 10000 });
    setListPost(dataRes);
    formSearch.resetFields();
    handleChangeEditor();
  };

  const handleSearch = () => {
    const dataForm = formSearch.getFieldsValue();
    if (
      dataForm.postName === undefined
    ) {
      dataForm.postName = '';
    }
    let dataRes = []
   if(dataForm.category){
    dataRes = listPost.filter(item => {
      console.log(item.category._id , dataForm.category)
      if(item.category._id == dataForm.category) return true;
    })
   }else {
    dataRes = [...listPost]
   }
   console.log(dataRes)
  const data = dataRes.filter(item => {
      if(toSlug(item.title).split("-").join(" ").search(toSlug(dataForm.postName).split("-").join(" ")) !== -1){
         return true;
      }
    })
    setListPostSearch(data);
  };
  const handleChangeEditor = () => {};

  const onDelete = async (key) => {
    if(window.confirm("Bạn có chắc muốn xóa không?")){
      const dataRes = await deletePosts(key);
      dataRes.status === 1
        ? message.success(`Xóa thành công! ${dataRes.message}`)
        : message.error(`Xóa thất bại! ${dataRes.message}`);
  
      const dataAll = await getAllPagingPostsV2();
      setListPost(dataAll);
    }

  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
    },
    {
      title: "Slug",
      dataIndex: "slug",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      render: (_, record) => {
        if(!record.category)   return "";
        return (
          <>
            {record.category.categoryName +
              (record.category.parent != null
                ? " (" + record.category.parent.categoryName + ")"
                : "")}{" "}
          </>
        );
      },
    },
    {
      title: "Tags",
      dataIndex: "tags",
      render: (_, record) => {
        const listTagName = _?.map((item, index) => {
          return (
            <Tag color="default" key={index}>
              {item.tagName}
            </Tag>
          );
        });
        return listTagName;
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      render: (_, record) => {
        const strText = record.description;
        return strText.slice(0, 50) + "...";
      },
    },
    {
      title: "Ảnh",
      dataIndex: "thumb",
      render: (_, record) => {
        return <Image width={150} src={`${process.env.REACT_APP_IMAGE_URL}/` + _} />;
      },
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      render: (_, record) => {
        return convertHtmlText(_);
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (_, record) => {
        if (_ === 0) return <Badge style={{whiteSpace: "nowrap"}} color="red" text="Ẩn bài" />;
        if (_ === 1) return <Badge style={{whiteSpace: "nowrap"}} color="green" text="Hiện bài" />;
        if (_ === 2) return <Badge style={{whiteSpace: "nowrap"}} color="blue" text="Chờ duyệt" />;
      },
    },
    {
      title: "Số người đọc",
      dataIndex: "numberOfReader",
    },
    {
      title: "Hành động",
      dataIndex: "",
      render: (_, record) =>
          <Space>
            <Tooltip title="Sửa">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                size="small"
                onClick={() => window.open(`/post/${record.key}`, '_blank')}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                type="danger"
                shape="circle"
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => onDelete(record.key)}
              />
            </Tooltip>
            <Tooltip title="Xem">
              <Button
                type="danger"
                shape="circle"
                icon={<FundViewOutlined />}
                size="small"
                onClick={() => window.open(process.env.REACT_APP_WEB_APP_URL + `/${record.slug}`, '_blank')}                
              />
            </Tooltip>
          </Space>
    },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Bài viết" pageTitle="Quản lí bài viết" />
          <Row>
            <Col xs={12}>
              <Form
                form={formSearch}
                layout="vertical"
                autoComplete="off"
              >
                <Row>
                  <Col sm={4} hidden={true}>
                    <Form.Item name="id" label="Id">
                      <Input name="id" />
                    </Form.Item>
                  </Col>
                  <Col sm={4}>
                    <Form.Item
                      name="postName"
                      label="Tiêu đề"
                      rules={[
                        {
                          required: false,
                          message: "Please input post name!",
                        },
                        {
                          type: "postName",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter post name"
                        name="postName"
                        allowClear={true}
                        onChange={(e) => setPostName(e.target.value)}
                        value={postName}
                      />
                    </Form.Item>
                  </Col>
                  <Col sm={4}>
                <Form.Item
                  name="category"
                  label="Danh mục"
                  rules={[
                    {
                      required: true,
                      message: "Please select post category!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select a post category!"
                    allowClear
                    showSearch
                    name="category"
                    filterOption={(input, option) =>
                      option.children.includes(input)
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children
                        .toLowerCase()
                        .localeCompare(optionB.children.toLowerCase())
                    }
                  >
                    {listCategory.length > 0 &&
                      listCategory.map((item) => {
                        return (
                          <Option key={item._id} value={item._id}>
                            {item.categoryName +
                              (item.parent != null
                                ? " (" + item.parent.categoryName + ")"
                                : "")}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col>
                </Row>
                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => handleSearch()}
                    >
                      Tìm kiếm
                    </Button>
                    <Link to={`/post`}>
                      <Button type="primary">Tạo mới</Button>
                    </Link>

                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => handleRefresh()}
                    >
                      Làm mới trang
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col xs={12} className="mt-2">
              <Table
                columns={columns}
                dataSource={listPostSearch}
              />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Posts;