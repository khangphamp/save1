import React, { useState, useEffect, useRef } from "react";
import { Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../common/BreadCrumb";
import {
  message,
  Input,
  Button,
  Form,
  Space,
  Select,
  Tooltip,
  Table,
  Switch,
} from "antd";
import "./style.css";
import {
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  deleteMenu,
  getAllMenu,
  insertMenu,
  updateMenu,
} from "../../helpers/helper";
import {
  getAllCategory,
} from "../../helpers/helper";
import moment from "moment";
import { Drawer } from "antd";
import toSlug from "../../common/function";
const { Option } = Select;

const Menus = () => {
  document.title = "Management Menus";

  const [form] = Form.useForm();
  const [listMenu, setListMenu] = useState([]);
  const [isShow, setIsShow] = useState(true);

  const [previewTitle, setPreviewTitle] = useState("");
  const [visibleForm, setVisibleForm] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const editorContentRef = useRef("");
  const [listCategory, setListCategory] = useState([])
  const [isUrl, setIsUrl] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListMenu(dataRes);
    }
    fetchData()
  }, []);
  useEffect(() => {
    getAllCategory( {
      pageIndex: 1,
      pageSize: 100000,
      search: "",
    }).then(listCategory => {
      setListCategory(listCategory.data);
    })
  },[])

  const getAllData = async (_prams) => {
    const params = _prams
      ? _prams
      : {
          pageIndex: 1,
          pageSize: 100000,
          search: "",
        };
    const dataRes = await getAllMenu(params);
    const data =
      dataRes?.data &&
      dataRes?.data.length > 0 &&
      dataRes?.data.map((item) => {
        return {
          key: item._id,
          menuName: item.menuName,
          representCategory: item.representCategory,
          menuIcon: item.menuIcon,
          menuOrder: item.menuOrder,
          type: item.type,
          parent: item.parent,
          isShow: item.isShow,
          content: item.content,
          menuUrl: item.menuUrl,
          createdTime: moment(new Date(item.createdTime)).format("DD/MM/YYYY"),
        };
      });
    return dataRes?.data ? data : [];
  };

  const onFinish = async (data) => {
    const dataReq = {
      menuName: data.menuName,
      menuSlug: data.menuSlug,
      menuIcon: previewTitle,
      menuOrder: data.menuOrder,
      parent: data.parent,
      menuUrl: isUrl?data.menuUrl: null,
      representCategory: isUrl?null:data.representCategory,
      isShow: isShow,
      type: data.type,
      content: editorContentRef.current
    };
    if (!data.id) {
      //Save
      const dataRes = await insertMenu(dataReq);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công! ${dataRes.message}`);
        setVisibleForm(false);
        handleCloseDrawer();
      } else {
        message.error(`Save Failed! ${dataRes.message}`);
      }
    } else {
      //Update

      const dataRes = await updateMenu(data.id, dataReq);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công! ${dataRes.message}`);
        handleCloseDrawer();
      } else {
        message.error(`Save Failed! ${dataRes.message}`);
      }
    }
    const dataRes = await getAllData();
    setListMenu(dataRes);
    form.resetFields();
    setPreviewTitle("");
  };
  const handleChangeTitle = (value) => {
    form.setFieldsValue({
      menuSlug: toSlug(value),
    });
  };
  const handleRefresh = async () => {
    form.resetFields();
    const dataRes = await getAllData();
    setListMenu(dataRes);
  };


  const onEdit = async (key) => {
    const dataEdit = listMenu.filter((item) => item.key === key);

    setIsShow(dataEdit[0].isShow);
    form.setFieldsValue({
 
      menuName: dataEdit[0].menuName,
      menuUrl: dataEdit[0].menuUrl,
      menuSlug: dataEdit[0].menuSlug,
      menuIcon: dataEdit[0].menuIcon,
      menuOrder: dataEdit[0].menuOrder,
      parent: dataEdit[0].parent,
      representCategory: dataEdit[0].representCategory?._id  || null,
      type: dataEdit[0].type,
      id: dataEdit[0].key,
      isShow: dataEdit[0].isShow,
    });
    setIsUrl(dataEdit[0].menuUrl)  
    editorContentRef.current = dataEdit[0].content;
    setPreviewTitle(dataEdit[0].menuIcon);
    setDrawerTitle("Sửa Menu");
    showDrawer();
  };

  const onDelete = async (key) => {
    if(window.confirm("Bạn có chắc muốn xóa không?")){
      const dataRes = await deleteMenu(key);
      dataRes.status === 1
        ? message.success(`Xóa thành công! ${dataRes.message}`)
        : message.error(`Xóa thất bại! ${dataRes.message}`);
  
      handleRefresh();
    }
  };


  const handleNewMenu = () => {
    setDrawerTitle("Thêm Menu");
    showDrawer();
    form.resetFields();
  };
  const onClose = () => {
    setVisibleForm(false);
  };

  const columns = [
    {
      title: "Tên menu",
      dataIndex: "menuName",
    },
    {
      title: "Đường dẫn menu",
      dataIndex: "menuUrl",
    },
    {
      title: "Danh mục đại diện",
      dataIndex: "",
      render: (_, record) => {
        console.log(record)
        return record.parent?.menuName;
      }
    },
    {
      title: "Thứ tự sắp xếp",
      dataIndex: "menuOrder",
    },
    {
      title: "Menu cha",
      dataIndex: "",
      render: (_, record) => {
        const item = listMenu.find((item) => item.key === record?.parent);
        console.log(item);
        return item?.menuName;
      }
    },
    {
      title: "Hành động",
      dataIndex: "",
      render: (_, record) =>
        listMenu.length >= 1 ? (
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
          <BreadCrumb title="Menu" pageTitle="Quản lí menu" />

          <div>
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
                    name="menuName"
                    label="Tên menu"
                    rules={[
                      {
                        required: true,
                        message: "Please input menu  name!",
                      },
                      {
                        type: "menuName",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter name"
                      name="menuName"
                      allowClear={true}
                      onChange={(e) => handleChangeTitle(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item name="Url" label="Menu có một đường dẫn">
                    <Switch checked={isUrl} onChange={(v) => setIsUrl(v)}/>
                  </Form.Item>
                  {isUrl?                   <Form.Item
                    name="menuUrl"
                    label="Đường dẫn menu"
                  >
                    <Input
                      placeholder="Enter url"
                      name="menuUrl"
                      allowClear={true}
                      onChange={(e) => handleChangeTitle(e.target.value)}
                    />
                  </Form.Item>
                :  
                  <Form.Item name="representCategory" label="Danh mục đại diện">
                    <Select
                      placeholder="Select a represent category!"
                      allowClear
                      showSearch
                      name="representCategory"
                    >
                      {listCategory.length > 0 &&
                        listCategory.map((item) => {
                          return (
                            <Option key={item._id} value={item._id}>
                              {item.categoryName}
                            </Option>
                          );
                        })}
                    </Select>
                </Form.Item>
                }
                 

                  <Form.Item name="menuOrder" label="Thứ tự sắp xếp">
                    <Input
                      placeholder="Enter number of menu order"
                      name="menuOrder"
                      allowClear={true}
                      type="number"
                    />
                  </Form.Item>
                  <Form.Item name="parent" label="Menu cha">
                    <Select
                      placeholder="Select a menu parent!"
                      allowClear
                      showSearch
                      name="menus"
                    >
                      {listMenu.length > 0 &&
                        listMenu.map((item) => {
                          return (
                            <Option key={item.key} value={item.key}>
                              {item.menuName}
                            </Option>
                          );
                        })}
                    </Select>
                  </Form.Item>
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
                    <Button type="primary" onClick={handleNewMenu}>
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
            <Table columns={columns} dataSource={listMenu} />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Menus;