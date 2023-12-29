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
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  deleteRole,
  getPagingRole,
  insertRole,
  updateRole,
} from "../../../helpers/helper";
import moment from "moment";
import BreadCrumb from "../../../common/BreadCrumb";

const Roles = () => {
  document.title = "Management Roles";

  const [form] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [listRole, setListRole] = useState([]);
  const [isShow, setIsShow] = useState(false);
  const [visibleForm, setVisibleForm] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListRole(dataRes);
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
    const dataRes = await getPagingRole(params);

    const data =
      dataRes?.data &&
      dataRes?.data.length > 0 &&
      dataRes?.data.map((item) => {
        return {
          key: item._id,
          roleName: item.roleName,
          createdTime: moment(new Date(item.createdTime)).format("DD/MM/YYYY"),
        };
      });
    return dataRes?.data ? data : [];
  };

  const onFinish = async (data) => {
    const dataReq = {
      roleName: data.roleName,
    };

    if (!data.id) {
      //Save
      const dataRes = await insertRole(dataReq);
      dataRes.status === 1
        ? message.success(`Lưu thành công! ${dataRes.message}`)
        : message.error(`Save Failed! ${dataRes.message}`);
    } else {
      //Update
      const dataRes = await updateRole(data.id, dataReq);
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
    setListRole(dataRes);
  };

  const handleSearch = async () => {
    const dataForm = formSearch.getFieldsValue();
    const params = {
      pageIndex: 1,
      pageSize: 10,
      search: dataForm.roleName ? dataForm.roleName : "",
    };
    const dataRes = await getAllData(params);
    setListRole(dataRes);
  };

  const onEdit = (key) => {
    const dataEdit = listRole.filter((item) => item.key === key);

    form.setFieldsValue({
      roleName: dataEdit[0].roleName,
      id: dataEdit[0].key,
    });
    setDrawerTitle("Sửa quyền");
    showDrawer();
  };

  const onDelete = async (key) => {
    const dataRes = await deleteRole(key);

    dataRes.status === 1
      ? message.success(`Xóa thành công! ${dataRes.message}`)
      : message.error(`Xóa thất bại! ${dataRes.message}`);

    handleRefresh();
  };

  const columns = [
    {
      title: "Tên Quyền",
      dataIndex: "roleName",
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdTime",
    },
    {
      title: "Hành động",
      dataIndex: "",
      render: (_, record) =>
        listRole.length >= 1 ? (
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
  const handleNewRole = () => {
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
          <BreadCrumb title="Quyền người dùng" pageTitle="Quản lí Quyền" />

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
                      name="roleName"
                      label="Tìm kiếm theo Tên"
                      rules={[
                        {
                          required: false,
                          message: "Please input role name!",
                        },
                        {
                          type: "roleName",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter role name"
                        name="roleName"
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
                    <Button type="primary" onClick={handleNewRole}>
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
                      name="roleName"
                      label="Tên Quyền"
                      rules={[
                        {
                          required: true,
                          message: "Please input role name!",
                        },
                        {
                          type: "roleName",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter role name"
                        name="roleName"
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
                        Làm mới trang
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
            <Table columns={columns} dataSource={listRole} />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Roles;