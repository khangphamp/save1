import React, { useState, useEffect, useRef } from "react";
import { Col, Container, Row } from "reactstrap";
import {
  message,
  Input,
  Button,
  Form,
  Space,
  Select,
  Tooltip,
  Table,
  Drawer,
  Upload,
  Modal,
  Image,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import {
  deleteUser,
  getAllRole,
  getPagingUser,
  insertUser,
  updateUser,
} from "../../../helpers/helper";
import moment from "moment";
import BreadCrumb from "../../../common/BreadCrumb";
import UserStatus from "../../../store/status/userStatus";
import Editor, { UploadService } from "../../../Components/Common/Editor";

const { Option } = Select;

const Users = () => {
  document.title = "Management Users";

  const [form] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [listUser, setListUser] = useState([]);
  const [listRole, setListRole] = useState([]);
  const [listStatus, setListStatus] = useState([]);
  const [visibleForm, setVisibleForm] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const refDescription = useRef("");
  const refContent = useRef("");
  const [previewImage, setPreviewImage] = useState("");
  const [descriptionData, setDescriptionData] = useState("");
  const [contentData, setContentData] = useState("");
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");


  const refId = useRef("common");
  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListUser(dataRes);
      //get role
      const resListRole = await getAllRole();
      setListRole(resListRole);
      setListStatus(UserStatus);
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
    const dataRes = await getPagingUser(params);

    const data =
      dataRes?.data &&
      dataRes?.data.length > 0 &&
      dataRes?.data.map((item) => {
        return {
          key: item._id,
          ...item,
          userName: item.userName,
          fullName: item.fullName,
          email: item.email,
          phoneNumber: item.phoneNumber,
          roleName: item.role?.roleName,
          activeStatus:
            item.activeStatus === 1 ? "Kích hoạt" : "Ngưng kích hoạt",
          createdTime: moment(new Date(item.createdTime)).format("DD/MM/YYYY"),
        };
      });
    return dataRes?.data ? data : [];
  };

  const onFinish = async (data) => {
    const dataReq = {
      userName: data.userName,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      activeStatus: data.activeStatus,
      role: data.role,
      avatar: previewTitle,
      urlSocical: data.urlSocical,
      description: refDescription.current,
      content: refContent.current
    };
    if(data.password){
      dataReq.password = data.password;
    }
    if (!data.id) {
      //Save
      const dataRes = await insertUser(dataReq);
      dataRes.status === 1
        ? message.success(`Lưu thành công! ${dataRes.message}`)
        : message.error(`Save Failed! ${dataRes.message}`);
      if (dataRes.status === 1) {
        onClose();
      }
    } else {
      //Update
      const dataRes = await updateUser(data.id, dataReq);
      dataRes.status === 1
        ? message.success(`Update Success! ${dataRes.message}`)
        : message.error(`Update Failed! ${dataRes.message}`);
      if (dataRes.status === 1) {
        onClose();
      }
    }

    form.resetFields();
    formSearch.resetFields();
    handleRefresh();
    const dataRes = await getAllData();
    setListUser(dataRes);
  };
  const handleChange = async ({ fileList: newFileList }) => {
    if(!newFileList[0]?.originFileObj) return;
    var formData = new FormData();
    formData.append('refId', refId.current);
    formData.append("file", newFileList[0].originFileObj);
    await UploadService(formData)
    .then((res) => {
      setFileList(newFileList);
      setPreviewTitle(refId.current + "/" + res.url)
    })
  };
  const handleCancel = () => setPreviewVisible(false);
  const propsUpload = {
    onRemove: async (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
      setPreviewImage("");

    },
    method: "GET",
    beforeUpload: async (file) => {
      setFileList([file]);
      return;
    
    },
  };
  const handleRefresh = async () => {
    form.resetFields();
    setDescriptionData("");
    setContentData("");
    refDescription.current = "";
    refContent.current = "";
  };
  const handleRefreshSearch = async () => {
    formSearch.resetFields();
    const dataRes = await getAllData();
    setListUser(dataRes);
  };

  const handleSearch = async () => {
    const dataForm = formSearch.getFieldsValue();
    const params = {
      pageIndex: 1,
      pageSize: 10,
      search: dataForm.userName ? dataForm.userName : "",
    };

    const dataRes = await getAllData(params);
    setListUser(dataRes);
  };
  const onClose = () => {
    setVisibleForm(false);
  };
  const showDrawer = () => {
    setVisibleForm(true);
  };
  const handleNewUser = () => {
    setDrawerTitle("Thêm người dùng");
    showDrawer();
    form.resetFields();
  };
  const onEdit = (key) => {
    const dataEdit = listUser.filter((item) => item.key === key);
    const dataRole = listRole.filter(
      (item) => item.roleName === dataEdit[0].roleName
    );
    const dataStatus = listStatus.filter(
      (item) => item.label === dataEdit[0].activeStatus
    );

    form.setFieldsValue({
      id: dataEdit[0].key,
      userName: dataEdit[0].userName,
      fullName: dataEdit[0].fullName,
      phoneNumber: dataEdit[0].phoneNumber,
      email: dataEdit[0].email,
      activeStatus: dataStatus[0].value,
      roleName: dataRole[0].roleName,
      role: dataRole[0]._id,
      urlSocical: dataEdit[0].urlSocical,
    });
    setFileList([
      {
        url: `${process.env.REACT_APP_IMAGE_URL}/${dataEdit[0]?.avatar}`,
        name: dataEdit[0]?.avatar,
      },
    ]);
    setPreviewImage(`${process.env.REACT_APP_IMAGE_URL}/${dataEdit[0]?.avatar}`);
    setPreviewTitle(dataEdit[0]?.avatar);
    setDescriptionData(dataEdit[0].description);
    refDescription.current = dataEdit[0].description;
    setContentData(dataEdit[0].content);
    refContent.current = dataEdit[0].content;
    setDrawerTitle("Sửa người dùng");
    showDrawer();
  };

  const onDelete = async (key) => {
    const dataRes = await deleteUser(key);
    dataRes.status === 1
      ? message.success(`Xóa thành công! ${dataRes.message}`)
      : message.error(`Xóa thất bại! ${dataRes.message}`);

    handleRefreshSearch();
  };

  const columns = [
    {
      title: "Tên đăng nhập",
      dataIndex: "userName",
    },
    {
      title: "Ảnh đại diện",
      dataIndex: "avatar",
      render: (_, record) => {
        if(_){
          return <Image width={150} src={`${process.env.REACT_APP_IMAGE_URL}/` + _} />;
        }else {
          return <></>
        }
      },
    },
    {
      title: "Tên người dùng",
      dataIndex: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdTime",
    },
    {
      title: "Quyền",
      dataIndex: "roleName",
    },
    {
      title: "Trạng thái",
      dataIndex: "activeStatus",
    },
    {
      title: "Hành động",
      dataIndex: "",
      render: (_, record) =>
        listUser.length >= 1 ? (
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

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="User" pageTitle="Management Users" />
          <div>
            <Col>
              <Drawer
                title={drawerTitle}
                placement={"right"}
                width={"50%"}
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
                    <Col>
                      <Form.Item
                        name="userName"
                        label="Tên đăng nhập"
                        rules={[
                          {
                            required: true,
                            message: "Please input user name!",
                          },
                          {
                            type: "userName",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter user name"
                          name="userName"
                          allowClear={true}
                        />
                      </Form.Item>

                      <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                      >
                        <Input
                          placeholder="Enter post fullName!"
                          name="phoneNumber"
                          allowClear={true}
                        />
                      </Form.Item>
                  
                <Form.Item
                  name="avatar"
                  label="Ảnh đại diện"
                  className=""
                >
                  <Space align="start">
                    <Upload
                      {...propsUpload}
                      listType="picture-card"
                      fileList={fileList}
                      onChange={handleChange}
                      // onPreview={handlePreview}
                    >
                      {fileList.length >= 1 ? null : (
                        <div>
                          <PlusOutlined />
                          <div
                            style={{
                              marginTop: 8,
                            }}
                          >
                            Tải lên
                          </div>
                        </div>
                      )}
                    </Upload>
                    {previewImage && (
                      <>
                        <Modal
                          open={previewVisible}
                          title={previewTitle}
                          footer={null}
                          onCancel={handleCancel}
                        >
                          <img
                            alt={previewTitle}
                            style={{ width: "100%" }}
                            src={previewImage}
                          />
                        </Modal>
                      </>
                    )}
                  </Space>
                </Form.Item>

                      <Form.Item
                        name="role"
                        label="Quyền"
                        rules={[
                          {
                            required: true,
                            message: "Please select role!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select a role!"
                          allowClear
                          showSearch
                          name="roles"
                        >
                          {listRole.length > 0 &&
                            listRole.map((item) => {
                              return (
                                <Option key={item._id} value={item._id}>
                                  {item.roleName}
                                </Option>
                              );
                            })}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                          {
                            required:drawerTitle == "Sửa người dùng"? false: true,
                            message: "Please input password!",
                          },
                          {
                            type: "password",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter post password!"
                          name="password"
                          allowClear={true}
                        />
                      </Form.Item>

                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          {
                            type: "email",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter post email!"
                          name="email"
                          allowClear={true}
                        />
                      </Form.Item>

                      <Form.Item
                        name="fullName"
                        label="Tên người dùng"
                        rules={[
                          {
                            type: "fullName",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter post full name!"
                          name="fullName"
                          allowClear={true}
                        />
                      </Form.Item>
                      <Form.Item
                        name="urlSocical"
                        label="Url mạng xã hội"
                      >
                        <Input
                          placeholder="Enter url"
                          name="urlSocical"
                          allowClear={true}
                        />
                      </Form.Item>
                      <Form.Item
                        name="activeStatus"
                        label="Trạng thái"
                        rules={[
                          {
                            required: true,
                            message: "Please select active status!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select a active status!"
                          allowClear
                          showSearch
                          name="activeStatus"
                        >
                          {listStatus.length > 0 &&
                            listStatus.map((item) => {
                              return (
                                <Option key={item.value} value={item.value}>
                                  {item.label}
                                </Option>
                              );
                            })}
                        </Select>
                      </Form.Item>
                      
                    </Col>
                    <Col xs={12}>
                      <div className="ant-col ant-form-item-label">
                        <label
                          htmlFor="description"
                          className="ant-form-item-required"
                          title="Post description"
                        >
                          Đoạn giới thiệu ngắn
                        </label>
                      </div>
                      <Editor
                        value={descriptionData}
                        onChange={(v) => refDescription.current = v}
                        refId={refId}
                      />
                    </Col>
                    <Col xs={12}>
                      <div className="ant-col ant-form-item-label">
                        <label
                          htmlFor="content"
                          className="ant-form-item-required"
                          title="Post content"
                        >
                          Tiểu sử
                        </label>
                      </div>
                      <Editor
                        value={contentData}
                        onChange={(v) => refContent.current = v}
                        refId={refId}
                      />
                    </Col>           
                  </Row>
                  <Form.Item className="mt-3">
                    <Space>
                      <Button type="primary" htmlType="submit">
                        Save
                      </Button>
                      <Button
                        type="primary"
                        htmlType="button"
                        onClick={() => handleRefresh()}
                      >
                        Refresh
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Drawer>
            </Col>
          </div>
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
                      name="userName"
                      label="Tên đăng nhập"
                      rules={[
                        {
                          required: false,
                          message: "Please input user name!",
                        },
                        {
                          type: "userName",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter user name"
                        name="userName"
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
                    <Button type="primary" onClick={handleNewUser}>
                      Tạo mới
                    </Button>
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => handleRefreshSearch()}
                    >
                       Làm mới trang
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <div>
            <Table columns={columns} dataSource={listUser} />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Users;