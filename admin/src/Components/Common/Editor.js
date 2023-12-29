
import React, { useState } from "react";

// import CKEditor
import {CKEditor} from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { APIClient } from "../../helpers/api_helper";

// import Upload Adapter
const api = new APIClient();
// export const UploadService = async (loader) => {
//   try {
//     loader.file.then(async file => {
//       console.log(file);
//       var formData = new FormData();
//       formData.append('refId', "adasdsa");
//       formData.append("file", file);
//       const response = await api.create(
//         `/api/post/upload`, formData)
//       let data = `${process.env.REACT_APP_IMAGE_URL}/${"adasdsa"}/` + response.data.url;
//       return {default: data}
//     })
//   } catch (error) {
//     return error;
//   }
// }
export const UploadService = async (formData) => {
  try {
    const response = await api.create(
      `/api/post/upload`, formData)
    return response.data;
  } catch (error) {
    return error;
  }
}
function Editor({onChange, value = "", refId}) {
  function uploadAdapter(loader) {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          loader.file.then((file) => {
            var formData = new FormData();
            formData.append('refId', refId.current);
            formData.append("file", file);
            api.create(
              `/api/post/upload`, formData)
            .then(response => {
              let data = `${process.env.REACT_APP_IMAGE_URL}/${refId.current}/` + response.data.url;
              resolve({
                default: data
              });
  
            })
            .catch(err => {
              reject(err);
            })
  
          });
        });
      }
    };
  }
  function CustomUploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = loader => {
      return uploadAdapter(loader);
    };
  }
  return (
    <CKEditor
    config={{
      extraPlugins: [CustomUploadAdapterPlugin],
      heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
        ]
    }}}
    editor={ClassicEditor}
    data={value}
    onChange={(event, editor) => {
      const data = editor.getData();
      onChange(data)
    }}
  />
  )
}

export default Editor