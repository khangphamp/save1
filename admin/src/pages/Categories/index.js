import React, { useState, useEffect, useRef } from "react";
import { Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../common/BreadCrumb";
import {
  message,
  Input,
  Button,
  Form,
  Space,
  Tooltip,
  Table,
} from "antd";
import "./style.css";
import {
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  deleteCategory,
  getAllCategory,
  insertCategory,
  updateCategory,
} from "../../helpers/helper";
import moment from "moment";
import { Drawer } from "antd";
import toSlug from "../../common/function";
import Editor from "../../Components/Common/Editor";

const Categories = () => {
  document.title = "Management Categories";

  const [form] = Form.useForm();
  const [listCategory, setListCategory] = useState([]);
  const [isShow, setIsShow] = useState(true);
  const [visibleForm, setVisibleForm] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");

  const [content, setContent] = useState(null);

  const editorContentRef = useRef("");
  const nameRefId = useRef("common")

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListCategory(dataRes);
    }
    fetchData();
  }, []);
  const getAllData = async (_prams) => {
    const params = _prams
      ? _prams
      : {
          pageIndex: 1,
          pageSize: 100000,
          search: "",
          content: true
        };
    const dataRes = await getAllCategory(params);
    const data =
      dataRes?.data &&
      dataRes?.data.length > 0 &&
      dataRes?.data.map((item) => {
        return {
          key: item._id,
          categoryName: item.categoryName,
          categorySlug: item.categorySlug,
          categoryOrder: item.categoryOrder,
          type: item.type,
          isShow: item.isShow,
          content: item.content,
          canonical: item.canonical,
          faq: item.faq,
          seo_title: item.seo_title,
          createdTime: moment(new Date(item.createdTime)).format("DD/MM/YYYY"),
        };
      });
      function compare(a, b) {
        if(b.type){
          return a.type === b.type ? 1 : 0;
        }
        else {
          return -1;
        }
      
       
      }
      
      data.sort(compare);
      console.log(data);
    return dataRes?.data ? data : [];
  };

  const onFinish = async (data) => {
    const dataReq = {
      categoryName: data.categoryName,
      categorySlug: data.categorySlug,
      categoryOrder: data.categoryOrder,
      isShow: isShow,
      type: data.type,
      content: editorContentRef.current,
      canonical: data.canonical,
      faq: data.faq,
      seo_title: data.seo_title
    };
    if (!data.id) {
      //Save
      const dataRes = await insertCategory(dataReq);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công! ${dataRes.message}`);
        setVisibleForm(false);
        handleCloseDrawer();
      } else {
        message.error(`Save Failed! ${dataRes.message}`);
      }
    } else {
      //Update

      const dataRes = await updateCategory(data.id, dataReq);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công! ${dataRes.message}`);
        handleCloseDrawer();
      } else {
        message.error(`Save Failed! ${dataRes.message}`);
      }
    }
    const dataRes = await getAllData();
    setListCategory(dataRes);
    form.resetFields();
  };
  const handleChangeTitle = (value) => {
    form.setFieldsValue({
      categorySlug: toSlug(value),
    });
  };
  const handleRefresh = async () => {
    form.resetFields();
    const dataRes = await getAllData();
    setListCategory(dataRes);
  };


  const onEdit = async (key) => {
    const dataEdit = listCategory.filter((item) => item.key === key);

    setIsShow(dataEdit[0].isShow);
    form.setFieldsValue({
      categoryName: dataEdit[0].categoryName,
      categorySlug: dataEdit[0].categorySlug,
      categoryOrder: dataEdit[0].categoryOrder,
      type: dataEdit[0].type,
      id: dataEdit[0].key,
      isShow: dataEdit[0].isShow,
      canonical: dataEdit[0].canonical,
      faq: dataEdit[0].faq,
      seo_title: dataEdit[0].seo_title

    });
    setContent(dataEdit[0].content || "");
    editorContentRef.current = dataEdit[0].content;
    setDrawerTitle("Sửa danh mục");
    showDrawer();
  };

  const onDelete = async (key) => {
    if(window.confirm("Bạn có chắc muốn xóa không?")){
      const dataRes = await deleteCategory(key);
      dataRes.status === 1
        ? message.success(`Xóa thành công! ${dataRes.message}`)
        : message.error(`Xóa thất bại! ${dataRes.message}`);
  
      handleRefresh();
    }
  };


  const handleNewCategory = () => {
    setContent("")
    setDrawerTitle("Thêm Danh mục");
    showDrawer();
    form.resetFields();
  };
  const onClose = () => {
    setContent(null)
    setVisibleForm(false);
  };

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "categoryName",
    },
    {
      title: "Slug",
      dataIndex: "categorySlug",
    },
    {
      title: "Thứ tự sắp xếp",
      dataIndex: "categoryOrder",
    },
    {
      title: "Loại danh mục",
      dataIndex: "type",
    },
    {
      title: "Hành động",
      dataIndex: "",
      render: (_, record) =>
        listCategory.length >= 1 ? (
          <Space>
            <Tooltip title="Sửa">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                size="small"
                onClick={() => onEdit(record.key)}
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
          </Space>
        ) : null,
    },
  ];

  const showDrawer = () => {
    setVisibleForm(true);
  };

  const handleCloseDrawer = () => {
    setVisibleForm(false);
    form.resetFields();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Danh mục" pageTitle="Quản lí danh mục" />

          <div>
            <Drawer
              title={drawerTitle}
              placement={"right"}
              width={"70%"}
              onClose={onClose}
              open={visibleForm}
              bodyStyle={{
                paddingBottom: 80,
              }}
              style={{ marginTop: "70px" }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
              >
                <Row>
                  <Col hidden={true}>
                    <Form.Item name="id" label="Id">
                      <Input name="id" />
                    </Form.Item>
                  </Col>
                  <Form.Item
                    name="categoryName"
                    label="Tên danh mục"
                    rules={[
                      {
                        required: true,
                        message: "Please input category  name!",
                      },
                      {
                        type: "categoryName",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter name"
                      name="categoryName"
                      allowClear={true}
                      onChange={(e) => handleChangeTitle(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item
                    name="categorySlug"
                    label="Slug danh mục"
                    rules={[
                      {
                        required: true,
                        message: "Please input category slug!",
                      },
                      {
                        type: "categorySlug",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter post slug!"
                      name="categorySlug"
                      allowClear={true}
                    />
                  </Form.Item>

                   <Form.Item name="categoryOrder" label="Thứ tự sắp xếp">
                    <Input
                      placeholder="Enter number of category order"
                      name="categoryOrder"
                      allowClear={true}
                      type="number"
                    />
                  </Form.Item>

                  <Form.Item name="type" label="Loại danh mục">
                    <Input
                      placeholder="Enter string of category type"
                      name="type"
                      allowClear={true}
                      type="string"
                    />
                  </Form.Item>
                  <Form.Item
                  name="seo_title"
                  label="SEO Title"
                >
                  <Input
                    placeholder="Enter SEO Title"
                    name="seo_title"
                    allowClear={true}
                    onChange={(e) => {
                      form.setFieldsValue({
                        seo_title: e.target.value,
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="canonical"
                  label="Thẻ canonical"
                >
                  <Input
                    placeholder="Enter canonical"
                    name="canonical"
                    allowClear={true}
                    onChange={(e) => {
                      form.setFieldsValue({
                        canonical: e.target.value,
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="faq"
                  label="FAQ (json)"
                >
                  <Input
                    placeholder="Enter FAQ"
                    name="faq"
                    allowClear={true}
                    onChange={(e) => {
                      form.setFieldsValue({
                        faq: e.target.value,
                      });
                    }}
                  />
                </Form.Item>
                  {content != null &&                 
                    <Form.Item label="Nội dung">
                    <Editor
                      value={content}
                      onChange={(v) => editorContentRef.current = v}
                      refId={nameRefId}
                    />
                  </Form.Item>}
                </Row>
                <Form.Item className="mt-3">
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Lưu
                    </Button>
                    <Button
                      type="info"
                      htmlType="button"
                      onClick={() => handleRefresh()}
                    >
                      Làm mới trang
                    </Button>
                    <Button type="danger" onClick={handleCloseDrawer}>
                      Đóng
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Drawer>
          </div>
          <Row>
            <Col xs={12}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
              >
                <Col hidden={true}>
                  <Form.Item name="id" label="Id">
                    <Input name="id" />
                  </Form.Item>
                </Col>
                <Form.Item className="mt-3">
                  <Space>
                    <Button type="primary" onClick={handleNewCategory}>
                      Tạo mới
                    </Button>

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

          <div>
            <Table columns={columns} dataSource={listCategory} />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Categories;