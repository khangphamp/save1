import React, { useEffect, useRef, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../../common/BreadCrumb";
import {
  PlusOutlined,
} from "@ant-design/icons";
import PostStatus from "../../../store/status/postStatus";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  Input,
  Button,
  Form,
  message,
  Space,
  Select,
  Modal,
  Upload,
  Switch,
  Drawer,
} from "antd";
import {
  getPagingTags,
  getPagingPostsV2,
  updatePosts,
  getPostById,
  insertTags,
  getAllCategory,
} from "../../../helpers/helper";
import { useHistory } from "react-router-dom";
import toSlug from "../../../common/function";
import Editor, { UploadService } from "../../../Components/Common/Editor";
import CaculateSeoPost from "../../../Components/Common/CaculateSeoPost";
const { Option } = Select;
const user_id = JSON.parse(sessionStorage.getItem("authUser"))
  ? JSON.parse(sessionStorage.getItem("authUser")).user._id
  : null;
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
        ratingValue: item.ratingValue
      };
    });
  return dataRes?.data ? dataListPost : [];
};
function isEmpty(obj) {
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = (error) => reject(error);
  });
export default function NewPost(props) {
  const history = useHistory();
  const [form] = Form.useForm();
  const [cacheSchemas, setCacheSchemas] = useState([]);
  const [post, setPost] = useState({});
  const [listStatus, setListStatus] = useState([]);
  const editorContentRef = useRef(null);
  const [content, setContent] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [listTag, setListTag] = useState([]);
  const [listCategory, setListCategory] = useState([]);
  const [descriptionData, setDescriptionData] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [listPost, setListPost] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [title, setTitle] = useState("");
  const [tagsName, setTagsName] = useState([]);
  const refId = useRef("");
  const [isShowInputUrlImage, setIsShowInputUrlImage] = useState(false);
  const [isShowModalSeo, setIsShowModalSeo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const resListCategory = await getAllCategory({ pageSize: 100000 });
      const resListTag = await getPagingTags({ pageSize: 100000 });
      const resListPost = await getAllPagingPostsV2({ pageSize: 100000 });
      setListCategory(resListCategory.data);
      setListPost(resListPost);
      setListTag(resListTag.data);
      setListStatus(PostStatus);
    };
    fetchData();
  }, []);
  useEffect(() => {
    const value = props.match.params;
    const getPost = async () => {
      const post = await getPostById(value.id);
      setPost(post);
      form.setFieldsValue({
        id: post?._id,
        title: post?.title,
        slug: post?.slug,
        category: post.category?._id || null,
        tags: post?.tags.map((item) => item._id),
        thumb: post?.thumb,
        status: post?.status,
        numberOfReader: post?.numberOfReader,
        videoUrl: post.videoUrl,
        isVideo: post.isVideo,
        keyfocus: post.seo_keyfocus,
        canonical: post.canonical,
        faq: post.faq,
        ratingValue: post.ratingValue,

      });
      if(post.isVideo){
        setIsShowInputUrlImage(true)
      }
      setFileList([
        {
          url: `${process.env.REACT_APP_IMAGE_URL}/${post?.thumb}`,
          name: post?.thumb,
        },
      ]);
      setPreviewImage(`${process.env.REACT_APP_IMAGE_URL}/${post?.thumb}`);
      setPreviewTitle(post?.thumb);
      setContent(post?.content);
      setDescriptionData(post?.description);
      editorContentRef.current = post?.content;
      setContent(post?.content);
      refId.current = post?.refId;
    };

    if (isEmpty(value) === false) {
      getPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.match.params]);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };
  const handleChangeTags = (value) => {
    const listTagName = value.map((item) => {
      const index = listTag.findIndex((x) => x._id === item);
      if (index !== -1) {
        return listTag[index].tagName;
      } else {
        return item;
      }
    });
    setTagsName(listTagName);
    if (cacheSchemas.length !== 0) {
      cacheSchemas.map((item) => {
        if (item?.script?.articleSection) {
          item.script.articleSection = listTagName;
        }
      });
      setCacheSchemas(cacheSchemas);
    }
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
  const onFinish = async (data) => {
    const addTags = await data.tags.map(async (item) => {
      const index = listTag.findIndex((x) => x._id === item);
      if (index === -1) {
        const dataReq = {
          tagName: item,
          tagSlug: toSlug(item),
        };
        const addTags = await insertTags(dataReq);
        const { _id } = await addTags.data;
        return _id;
      } else {
        return item;
      }
    });
    Promise.all(addTags).then(async (tags) => {
      let content = ""
      if (editorContentRef.current) {
        content = editorContentRef.current || "";
      }
      data.ratingValue = parseFloat(data.ratingValue).toFixed(1);
      const dataReq = {
        title: data.title,
        slug: data.slug,
        description: descriptionData,
        thumb: previewTitle,
        content: content,
        category: data.category || null,
        tags: tags,
        user: user_id,
        numberOfReader: data.numberOfReader,
        status: data.id ? data.status : data.status.value,
        refId: refId.current,
        isVideo: data.isVideo,
        videoUrl: data.isVideo?data.videoUrl: null,
        seo_keyfocus: data.keyfocus,
        canonical: data.canonical,
        faq: data.faq,
        ratingValue: data.ratingValue,
      };
      if(data.ratingValue != post.ratingValue){
        dataReq.ratingList = Array(post.ratingList.length || 1).fill(data.ratingValue)
      }
      const dataRes = await updatePosts(data.id, dataReq);
        if (dataRes.status === 1) {
            history.push("/posts")
            message.success(`Lưu thành công! ${dataRes.message}`);
        }else {
          message.error(dataRes.message);
        }
    });
  };
  const handleRefresh = async () => {
    form.resetFields();
    setFileList([]);
    setPreviewImage("");
    setCacheSchemas([]);
    setContent("");
    setDescriptionData("");
    editorContentRef.current.setContent("");
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
      return true;
    
    },
  };
  const handleChangeTitle = (value) => {
    setTitle(value);
  };
  const handleCancel = () => setPreviewVisible(false);

  const handleChangeMemu = (id) => {
    const item = listCategory.find(item => item._id == id);
    if(item?.categoryName == 'video'){
      setIsShowInputUrlImage(true)
    }else {
      setIsShowInputUrlImage(false);
      form.setFieldsValue({
        videoUrl: null,
      });
    }
  }

  const onChangeSwitch = (checked) => {
    setIsShowInputUrlImage(checked)
      form.setFieldsValue({
        isVideo: checked,
      });
    if(!checked) {
      form.setFieldsValue({
        videoUrl: ''
      });
    }
  }
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb
            title="Sửa bài viết"
            history={history}
            pageTitle="Quản lí bài viết"
          />
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => history.goBack()}
          />
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            // onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Row>
              <Col hidden={true}>
                <Form.Item name="id" label="Id">
                  <Input name="id" />
                </Form.Item>
              </Col>
              <Col sm={12}>
                <Form.Item
                  name="title"
                  label="Tiêu đề"
                  initialValue={post.title}
                  rules={[
                    {
                      required: true,
                      message: "Please input post title!",
                    },
                    {
                      type: "title",
                    },
                    {
                      type: "string",
                      min: 10,
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter title"
                    name="title"
                    allowClear={true}
                    onChange={(e) => handleChangeTitle(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col sm={12}>
                <Form.Item
                  name="slug"
                  label="Slug bài viết"
                  rules={[
                    {
                      required: false,
                      message: "Please input post slug!",
                    },
                    {
                      type: "slug",
                    },
                    {
                      type: "string",
                      min: 1,
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter post slug!"
                    name="slug"
                    allowClear={true}
                  />
                </Form.Item>
              </Col>
              <Col sm={12}>
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
                    onChange={handleChangeMemu}
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
                              (item.parent?.categoryName
                                ? " (" + item.parent.categoryName  + ")"
                                : "")}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={12}>
              <Form.Item
                  name="isVideo"
                  label="Bài viết có video"
                  initialValue={post.isVideo}
                >
                  <Switch checked={isShowInputUrlImage} onChange={onChangeSwitch} />
                </Form.Item>
              </Col>
              {isShowInputUrlImage && 
                <Col sm={12}>
                <Form.Item
                  name="videoUrl"
                  label="Đường dẫn url video"
                  initialValue={post.videoUrl}
                  rules={[
                    {
                      required: true,
                      message: "Please input post urlvideo!",
                    }
                  ]}
                >
                  <Input
                    placeholder="Enter videoUrl"
                    name="videoUrl"
                    allowClear={true}
                    onChange={(e) => {
                      form.setFieldsValue({
                        videoUrl: e.target.value,
                      });
                    }}
                  />
                </Form.Item>
              </Col>
            }
              <Col sm={12}>
                <Form.Item
                  name="tags"
                  label="Thẻ tags"
                  rules={[
                    {
                      required: true,
                      message: "Please select post tags!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select post tags!"
                    allowClear
                    onChange={handleChangeTags}
                    mode="tags"
                    name="tags"
                  >
                    {listTag.length > 0 &&
                      listTag.map((item) => {
                        return (
                          <Option key={item._id} value={item._id}>
                            {item.tagName}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={12}>
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
                            Upload
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

              <Col sm={12}>
                <Form.Item name="status" label="Trạng thái">
                  <Select
                    name="status"
                    placeholder="Select a post status!"
                    allowClear
                    // defaultValue={{ value: "1", label: "Hiện bài" }}
                  >
                    {listStatus.length > 0 &&
                      listStatus.map((item, index) => {
                        return (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={12}>
                <Form.Item name="numberOfReader" label="Số người đọc">
                  <Input
                    placeholder="Enter number of reader"
                    name="numberOfReader"
                    allowClear={true}
                    type="number"
                    // showCount
                  />
                </Form.Item>
              </Col>
              <Col sm={12}>
                <Form.Item
                  name="keyfocus"
                  label="Từ khóa trọng tâm bài viết"
                  initialValue={post.keyfocus}
                  rules={[
                    {
                      required: true,
                      message: "Please input post keyfocus!",
                    }
                  ]}
                >
                  <Input
                    placeholder="Enter keyfocus"
                    name="keyfocus"
                    allowClear={true}
                    onChange={(e) => {
                      form.setFieldsValue({
                        keyfocus: e.target.value,
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col sm={12}>
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
              </Col>
              <Col sm={12}>
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
              </Col>
              <Col sm={12}>
                <Form.Item
                  name="ratingValue"
                  label="Đánh giá sao"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your number!',
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || (parseFloat(value) >= 1 && parseFloat(value) <= 5)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Số phải nằm trong khoảng từ 1 đến 5!'));
                      },
                    }),
                
                  ]}
          
                >
                  <Input
                    placeholder="Enter ratingValue post"
                    name="ratingValue"
                    allowClear={true}
                    onChange={(e) => {
                      form.setFieldsValue({
                        ratingValue: e.target.value,
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={12}>
                <div className="ant-col ant-form-item-label">
                  <label
                    htmlFor="content"
                    className="ant-form-item-required"
                    title="Post Content"
                  >
                    Mô tả
                  </label>
                </div>
                <textarea value={descriptionData} onChange={(e) => setDescriptionData(e.target.value)} className="form-control" id="Input3" rows="3"></textarea>
              </Col>
              <Col xs={12}>
                <div className="ant-col ant-form-item-label">
                  <label
                    htmlFor="content"
                    className="ant-form-item-required"
                    title="Post Content"
                  >
                    Nội dung
                  </label>
                </div>
                {content && <Editor
                  value={content}
                  onChange={(v) => editorContentRef.current = v}
                  refId={refId}
                />}

                {/* </Form.Item> */}
              </Col>
            </Row>
            <Form.Item className="mt-3">
              <Space>
                <Button type="primary" htmlType="submit">
                  Lưu
                </Button>
                <Button
                  type="primary"
                  htmlType="button"
                  onClick={() => handleRefresh()}
                >
                  Làm mới trang
                </Button>
                <Button
                  type="primary"
                  htmlType="button"
                  onClick={() => setIsShowModalSeo(true)}
                >
                  Kiểm tra Seo
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Container>
      </div>
      <Drawer
          title={'Kiểm tra SEO'}
          placement={"right"}
          width={"30%"}
          onClose={() => setIsShowModalSeo(false)}
          open={isShowModalSeo}
          bodyStyle={{
            paddingBottom: 80,
          }}
          style={{ marginTop: "70px" }}
      >
    {isShowModalSeo && <CaculateSeoPost formData={form.getFieldValue()} descriptionData={descriptionData} editorContentRef={editorContentRef}/>}
      </Drawer>
    </React.Fragment>
  );
}