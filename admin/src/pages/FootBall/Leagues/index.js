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
  Upload,
  Checkbox,
  Modal,
} from "antd";
import "../../Menus/style.css";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from "@ant-design/icons";
import {
  deleteLeague,
  getAllLeague,
  getAllLeagueRef,
  insertLeague,
  updateLeague,
} from "../../../helpers/helper";
import { Drawer } from "antd";
import BreadCrumb from "../../../common/BreadCrumb";
import Editor, { UploadService } from "../../../Components/Common/Editor";
import toSlug from "../../../common/function";
const { Option } = Select;
const Leagues = () => {
  document.title = "Management Leagues";

  const [form] = Form.useForm();
  const [listLeague, setListLeague] = useState([]);

  const [visibleForm, setVisibleForm] = useState(false);
  const [content, setContent] = useState({odd: null, schedule: null, rank: null, result: null});
  
  const [drawerTitle, setDrawerTitle] = useState("");
  const [leaguesRef, setLeaguesRef] = useState([])
  const editorContentOddRef = useRef("");
  const editorContentScheduleRef = useRef("");
  const editorContentRankRef = useRef("");
  const editorContentResultRef = useRef("");
  const [contentCheckBox, setContentCheckBox] = useState([])
  const nameRefId = useRef("common");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListLeague(dataRes);
    }
    fetchData();
  }, []);

  useEffect( () =>  {
    getAllLeagueRef({season: 2022})
    .then((res) => {
      setLeaguesRef(res.response)
    })
  },[])

  const handleChange = async ({ fileList: newFileList }) => {
    if(!newFileList[0]?.originFileObj) return;
    var formData = new FormData();
    formData.append('refId', nameRefId.current);
    formData.append("file", newFileList[0].originFileObj);
    await UploadService(formData)
    .then((res) => {
      setFileList(newFileList);
      setPreviewTitle(nameRefId.current + "/" + res.url)
    })

  };
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
  const getAllData = async (_prams) => {
    const params = _prams
      ? _prams
      : {
          pageIndex: 1,
          pageSize: 100000,
          search: "",
        };
    const dataRes = await getAllLeague(params);
    const data =
      dataRes?.data &&
      dataRes?.data.length > 0 &&
      dataRes?.data.map((item) => {
        return {
          key: item._id,
          id: item._id,
          ...item
        };
      });
    return dataRes?.data ? data : [];
  };

  const onFinish = async (data) => {
    const dataReq = {
      key: data._id,
      name: data.name,
      refId: data.refId,
      order: data.order,
      slug: data.slug,
      contentOdd: editorContentOddRef.current,
      contentSchedule: editorContentScheduleRef.current,
      contentRank: editorContentRankRef.current,
      contentResult: editorContentResultRef.current,
      thumb: previewTitle,
    };
    console.log(data)
    if (!data.id) {
      //Save
      const dataRes = await insertLeague(dataReq);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công! ${dataRes.message}`);
        setVisibleForm(false);
        handleCloseDrawer();
      } else {
        message.error(`Save Failed! ${dataRes.message}`);
      }
    } else {
      //Update

      const dataRes = await updateLeague(data.id, dataReq);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công! ${dataRes.message}`);
        handleCloseDrawer();
      } else {
        message.error(`Save Failed! ${dataRes.message}`);
      }
    }
    const dataRes = await getAllData();
    setListLeague(dataRes);
    form.resetFields();
  };
  
  const handleRefresh = async () => {
    form.resetFields();
    setFileList([]);
    setPreviewImage("");
    setPreviewTitle("");
    const dataRes = await getAllData();
    setListLeague(dataRes);
  };
  const handleCancel = () => setPreviewVisible(false);
  const onEdit = async (key) => {
    const dataEdit = listLeague.filter((item) => item.key === key);

    form.setFieldsValue({
      id: dataEdit[0].id,
      name: dataEdit[0].name,
      refId: dataEdit[0].refId,
      menuIcon: dataEdit[0].menuIcon,
      order: dataEdit[0].order,
      slug: dataEdit[0].slug
    });
    setContent({odd: dataEdit[0].contentOdd || "", schedule: dataEdit[0].contentSchedule || "", rank: dataEdit[0].contentRank || "", result: dataEdit[0].contentResult || ""});
    editorContentOddRef.current = dataEdit[0].contentOdd;
    editorContentScheduleRef.current = dataEdit[0].contentSchedule;
    editorContentRankRef.current = dataEdit[0].contentRank;
    editorContentResultRef.current = dataEdit[0].contentResult;
    setDrawerTitle("Sửa giải đấu");
    showDrawer();
    setContentCheckBox([])
    if(dataEdit[0].thumb){
      setFileList([
        {
          url: `${process.env.REACT_APP_IMAGE_URL}/${dataEdit[0]?.thumb}`,
          name: dataEdit[0]?.thumb,
        },
      ]);
      setPreviewImage(`${process.env.REACT_APP_IMAGE_URL}/${dataEdit[0]?.thumb}`);
      setPreviewTitle(dataEdit[0]?.thumb);
    }

  };

  const onDelete = async (key) => {
    if(window.confirm("Bạn có chắc muốn xóa không?")){
      const dataRes = await deleteLeague(key);
      dataRes.status === 1
        ? message.success(`Xóa thành công! ${dataRes.message}`)
        : message.error(`Xóa thất bại! ${dataRes.message}`);
  
      handleRefresh();
    }
  };


  const handleNewLeague = () => {
    setContent({odd: "", schedule: "", rank: "", result: ""});
    editorContentOddRef.current = ""
    setDrawerTitle("Thêm giải đấu");
    showDrawer();
    form.resetFields();
  };
  const onClose = () => {
    setContent({odd: null, schedule: null, rank: null, result: null});
    setVisibleForm(false);
    setContentCheckBox([])
    setFileList([]);
    setPreviewImage("");
    setPreviewTitle("");
  };

  const columns = [
    {
      title: "Tên giải đấu",
      dataIndex: "name",
    },
    {
      title: "Slug giải đấu",
      dataIndex: "slug",
    },
    {
      title: "Id giải đấu",
      dataIndex: "refId",
    },
    {
      title: "Thứ tự sắp xếp",
      dataIndex: "order",
    },
    {
      title: "Hành động",
      dataIndex: "",
      render: (_, record) =>
        listLeague.length >= 1 ? (
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
    setContent({odd: null, schedule: null, rank: null, result: null});
    setVisibleForm(false);
    form.resetFields();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Giải đấu" pageTitle="Quản lí giải đấu" />

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
                    name="name"
                    label="Tên giải đấu"
                    rules={[
                      {
                        required: true,
                        message: "Please input league  name!",
                      },
                      {
                        type: "name",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter name"
                      name="name"
                      allowClear={true}
                      type="string"
                      onChange={(e) => { 
                        form.setFieldsValue({slug: toSlug(e.target.value)})
                      }}
                    />
                  </Form.Item>
                  <Col>
                    <Form.Item
                      name="thumb"
                      label="Hình ảnh"
                      className=""
                      rules={[
                        {
                          required: true,
                          message: "Please select post thumb!",
                        },
                      ]}
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
                  </Col>

                  <Form.Item name="order" label="Thứ tự sắp xếp">
                    <Input
                      placeholder="Enter number of league order"
                      name="menuOrder"
                      allowClear={true}
                      type="number"
                    />
                  </Form.Item>

                  <Form.Item name="slug" label="Giả đấu slug">
                    <Input
                      placeholder="Enter menu slug"
                      name="slug"
                      allowClear={true}
                      type="string"
                    />
                  </Form.Item>
             
                  <Checkbox.Group style={{marginBottom: 10}} options={plainOptions} value={contentCheckBox} onChange={setContentCheckBox} />
                 
                  {content.odd != null && contentCheckBox.includes('tilekeo') &&                 
                    <Form.Item label="Nội dung (tỉ lệ kèo)">
                    <Editor
                      value={content.odd}
                      onChange={(v) => editorContentOddRef.current = v}
                      refId={nameRefId}
                    />
                  </Form.Item>}
                  {content.schedule != null && contentCheckBox.includes('lichthidau') &&                 
                    <Form.Item label="Nội dung (lịch thi đấu)">
                    <Editor
                      value={content.schedule}
                      onChange={(v) => editorContentScheduleRef.current = v}
                      refId={nameRefId}
                    />
                  </Form.Item>}
                  {content.rank != null && contentCheckBox.includes('bxh') &&                 
                    <Form.Item label="Nội dung (bảng xếp hạng)">
                    <Editor
                      value={content.rank}
                      onChange={(v) => editorContentRankRef.current = v}
                      refId={nameRefId}
                    />
                  </Form.Item>}
                  {content.result != null && contentCheckBox.includes('ketqua') &&                 
                    <Form.Item label="Nội dung (Kết quả)">
                    <Editor
                      value={content.result}
                      onChange={(v) => editorContentResultRef.current = v}
                      refId={nameRefId}
                    />
                  </Form.Item>}
                  <Form.Item name="refId" label="ID giải đâu">
                    <Select
                      placeholder="Select a league id!"
                      allowClear
                      showSearch
                      name="refId"
                      filterOption={(inputValue, option) => 
                        option.children.toLowerCase().includes(inputValue.toLowerCase())
                      }
                    
                    >
                      {leaguesRef.length > 0 &&
                        leaguesRef.map((item) => {
                          return (
                            <Option key={item.league.id} value={item.league.id}> 
                              {item.league.id + "-" + item.league.name}
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
                      Làm mới
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
                    <Button type="primary" onClick={handleNewLeague}>
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
            <Table columns={columns} dataSource={listLeague} />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Leagues;
const plainOptions = ['tilekeo', 'lichthidau', 'bxh', 'ketqua'];