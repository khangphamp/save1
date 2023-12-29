/* eslint-disable no-debugger */
import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "reactstrap";
import {
  message,
  Input,
  Button,
  Form,
  Space,
  Tooltip,
  Table,
  Drawer,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  deleteAction,
  getPagingAction,  
  insertAction,
  updateAction,
} from "../../../helpers/helper";
import moment from "moment";
import BreadCrumb from "../../../common/BreadCrumb";


const Actions = () => {
  document.title = "Management Actions";

  const [form] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [listAction, setListAction] = useState([]);
  const [visibleForm, setVisibleForm] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListAction(dataRes);
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
        };
    const dataRes = await getPagingAction(params);

    const data =
      dataRes?.data &&
      dataRes?.data.length > 0 &&
      dataRes?.data.map((item) => {
        return {
          key: item._id,
          actionName: item.actionName,
          createdTime: moment(new Date(item.createdTime)).format("DD/MM/YYYY"),
        };
      });
    return dataRes?.data ? data : [];
  };

  const onFinish = async (data) => {
    const dataReq = {
      actionName: data.actionName,
    };

    if (!data.id) {
      //Save
      const dataRes = await insertAction(dataReq);
      dataRes.status === 1
        ? message.success(`Lưu thành công! ${dataRes.message}`)
        : message.error(`Save Failed! ${dataRes.message}`);
    } else {
      //Update
      const dataRes = await updateAction(data.id, dataReq);
      dataRes.status === 1
        ? message.success(`Update Success! ${dataRes.message}`)
        : message.error(`Update Failed! ${dataRes.message}`);
    }
    formSearch.resetFields();
    form.resetFields();
    handleCloseDrawer();
    handleRefresh();
  };
  const handleRefreshCreate = () => {
    form.resetFields();
  };
  const handleRefresh = async () => {
    form.resetFields();
    formSearch.resetFields();
    const dataRes = await getAllData();
    setListAction(dataRes);
  };

  const handleSearch = async () => {
    const dataForm = formSearch.getFieldsValue();
    const params = {
      pageIndex: 1,
      pageSize: 10,
      search: dataForm.actionName ? dataForm.actionName : "",
    };
    const dataRes = await getAllData(params);
    setListAction(dataRes);
  };

  const onEdit = (key) => {
    const dataEdit = listAction.filter((item) => item.key === key);

    form.setFieldsValue({
      actionName: dataEdit[0].actionName,
      id: dataEdit[0].key,
    });
    setDrawerTitle("Sửa quyền");
    showDrawer();
  };

  const onDelete = async (key) => {
    const dataRes = await deleteAction(key);
    dataRes.status === 1
      ? message.success(`Xóa thành công! ${dataRes.message}`)
      : message.error(`Xóa thất bại! ${dataRes.message}`);

    handleRefresh();
  };

  const columns = [
    {
      title: "Tên quyền",
      dataIndex: "actionName",
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdTime",
    },
    {
      title: "Hành động",
      dataIndex: "",
      render: (_, record) =>
        listAction.length >= 1 ? (
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

  const onClose = () => {
    setVisibleForm(false);
  };
  const showDrawer = () => {
    setVisibleForm(true);
  };
  const handleNewAction = () => {
    setDrawerTitle("Thêm quyền");
    showDrawer();
    form.resetFields();
  };
  const handleCloseDrawer = () => {
    setDrawerTitle("");
    setVisibleForm(false);
    form.resetFields();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Danh sách quyền" pageTitle="Quản lí quyền" />

          <Row>
            <Col xs={12}>
              <Form
                form={formSearch}
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
                  <Col sm={3}>
                    <Form.Item
                      name="actionName"
                      label="Tìm kiếm theo tên"
                      rules={[
                        {
                          required: false,
                          message: "Please input action name!",
                        },
                        {
                          type: "actionName",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter name"
                        name="actionName"
                        allowClear={true}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item className="mt-3">
                  <Space>
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => handleSearch()}
                    >
                      Tìm kiếm
                    </Button>
                    <Button type="primary" onClick={handleNewAction}>
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
            <Col>
              <Drawer
                title={drawerTitle}
                placement={"right"}
                width={"30%"}
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
                      name="actionName"
                      label="Tên quyền"
                      rules={[
                        {
                          required: true,
                          message: "Please input action name!",
                        },
                        {
                          type: "actionName",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter name"
                        name="actionName"
                        allowClear={true}
                      />
                    </Form.Item>
                  </Row>
                  <Form.Item className="mt-3">
                    <Space>
                      <Button type="primary" htmlType="submit">
                        Lưu
                      </Button>
                      <Button
                        type="primary"
                        htmlType="button"
                        onClick={() => handleRefreshCreate()}
                      >
                        Làm mới 
                      </Button>
                      <Button type="danger" onClick={handleCloseDrawer}>
                        Đóng
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Drawer>
            </Col>
          </div>
          <div>
            <Table columns={columns} dataSource={listAction} />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Actions;