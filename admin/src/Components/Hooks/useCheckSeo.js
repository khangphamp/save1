import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toSlug from "../../common/function";
const data = [
  {
    id: 1,
    name: 'Thêm Từ khóa trọng tâm vào Tiêu đề',
    status: false,
    score: 10,
  },
  {
    id: 2,
    name: 'Thêm Từ khóa trọng tâm vào Mô tả',
    status: false,
    score: 10,
  },
  {
    id: 3,
    name: 'Thêm Từ khóa trọng tâm vào đường dẫn url',
    status: false,
    score: 10,
  },
  {
    id: 4,
    name: 'Sử dụng Từ khóa trọng tâm ngay đầu tiên của nội dụng( từ 10% trở về)',
    status: false,
    score: 6,
  },
  {
    id: 5,
    name: 'Sử dụng Từ khóa trọng tâm trong Nội dung',
    status: false,
    score: 10,
  },
  {
    id: 6,
    name: 'Nội dung dài 1000 từ',
    status: false,
    score: 10,
  },
  {
    id: 7,
    name: 'Sử dụng Từ khóa trọng tâm trong h1, h2, h3,...',
    status: false,
    score: 6,
  },
  {
    id: 8,
    name: 'Thêm hình ảnh alt có chứa Từ khóa trọng tâm',
    status: false,
    score: 6,
  },
  {
    id: 9,
    name: 'Tổng số Từ khóa trọng tâm chiếm 1% tổng số từ của Nội dung',
    status: false,
    score: 16,
  },
  {
    id: 10,
    name: 'Có link trong Nội dung',
    status: false,
    score: 4,
  },
  {
    id: 11,
    name: 'Sử dụng Từ khóa trọng tâm đúng ở đầu Tiêu đề',
    status: false,
    score: 4,
  },
  {
    id: 12,
    name: 'Sử dụng số trong Tiêu đề',
    status: false,
    score: 4,
  },
  {
    id: 13,
    name: 'Nội dung chứa hình or video',
    status: false,
    score: 4,
  }
]

function useCheckSeo({formData, descriptionData, editorContentRef}) {
  const [dataSeo, setDataSeo] = useState(data)
  const totalScore = useMemo(() => {
    const score = dataSeo.reduce((preValue,item) => {
      if(item.status){
        return item.score + preValue;
      }
      return preValue;
    }, 0)
    return score;
  },[dataSeo]) 
  const handleCheck = useCallback((type) => {
    if(!formData.keyfocus) {
      setDataSeo(data)
      return; 
    }
    const title = formData.title?.toLowerCase()
    const url = formData.slug?.toLowerCase();
    const keywordFocus = formData.keyfocus?.toLowerCase();
    const description = descriptionData?.toLowerCase() || "";
    const content = editorContentRef?.current?.toLowerCase() || "";
    if(!(title && url && keywordFocus && description && content)) return;
    setDataSeo(pre => {

      const newData = JSON.parse(JSON.stringify(pre));
      // Thêm Forcus keyword vào Title
      if(title.search(keywordFocus) !== -1){
        newData[0].status = true;
      }else{
        newData[0].status = false;
      }
      // Thêm Forcus keyword vào meta description
      if(description.search(keywordFocus) !== -1){
        newData[1].status = true;
      }else{
        newData[1].status = false;
      }
      // Thêm Forcus keyword vào URL
      if((url.split("-")).join(" ").search(toSlug(keywordFocus).split("-").join(" ")) !== -1){
        newData[2].status = true;
      }else{
        newData[2].status = false;
      }
      // Sử dụng Forcus keyword ngay đầu tiên của Content( từ 10% trở về)
      const node = document.createElement("div")
      node.innerHTML = content;
      const textContent = node.innerText || node.textContent;
      const arrTextContent = textContent.split(" ");
      const lengthArrTextContent = arrTextContent.length;
      const textContent10percent = arrTextContent.slice(0, Math.ceil(lengthArrTextContent * 1/10));
      if(textContent10percent.join(" ").search(keywordFocus) !== -1){
        newData[3].status = true;
      }else{
        newData[3].status = false;
      }
      //Sử dụng Forcus keyword trong Content
      if(textContent.search(keywordFocus) !== -1){
        newData[4].status = true;
      }else{
        newData[4].status = false;
      }
      // Content dài 1000 từ
      if(lengthArrTextContent >= 1000){
        newData[5].status = true;
        newData[5].name = `Content dài 1000 từ (${lengthArrTextContent} từ)`
      }else{
        newData[5].status = false;
        newData[5].name = `Content dài 1000 từ (${lengthArrTextContent} từ)`
      }
      // Sử dụng Forcus keyword trong h1, h2, h3,...
      const eles = node.querySelectorAll("h1, h2, h3, h4, h5, h6");
      let isTextInH = false;
      for (let i = 0; i < eles.length; i++) {
          const text = eles[i].innerText || eles[i].textContent;
          if(text.search(keywordFocus)  !== -1){
            isTextInH = true;
          }
      }
      if(isTextInH){
        newData[6].status = true;
      }else{
        newData[6].status = false;
      }
      //Thêm hình ảnh alt có chứa Forcus keyword
      const elesImg = node.querySelectorAll("img");
      let isImgHaveKey = false;
      const keywordsNew = toSlug(keywordFocus).split("-").join(" ")
      for (let i = 0; i < elesImg.length; i++) {
          const alt = elesImg[i].alt;
          if(alt){
            if(toSlug(alt).split("-").join(" ").search(keywordsNew) !== -1) {
              isImgHaveKey = true;
            }
          }
      }
      if(isImgHaveKey){
        newData[7].status = true;
      }else{
        newData[7].status = false;
      }
      // Tổng số Forcus keyword chiếm 1% tổng số từ của content
      const l = textContent.match(new RegExp(keywordFocus, "gi"))?.length
      if( l / lengthArrTextContent * 100 >= 1){
        newData[8].status = true;
        newData[8].name = `Tổng số Forcus keyword chiếm 1% tổng số từ của content(${l} từ)`
      }else{
        newData[8].status = false;
        newData[8].name = `Tổng số Forcus keyword chiếm 1% tổng số từ của content(${l} từ)`
      }
      // Có link trong content
      if(node.querySelectorAll("a").length > 0){
        newData[9].status = true;
      }else{
        newData[9].status = false;
      }
      //Sử dụng Forcus keyword đúng ở đầu title
      if(title.indexOf(keywordFocus) === 0){
        newData[10].status = true;
      }else{
        newData[10].status = false;
      }
      // Sử dụng số trong title
      if(title.match(/\d+(\.\d+)?/g)){
        newData[11].status = true;
      }else{
        newData[11].status = false;
      }
      //Content chứa hình or video
      if(node.querySelectorAll("img,video").length > 0){
        newData[12].status = true;
      }else{
        newData[12].status = false;
      }          
      return newData;
    })
  },[editorContentRef, descriptionData, formData])
  useEffect(() => {
    handleCheck(true);
  },[editorContentRef, descriptionData, formData, handleCheck])
  return {handleCheck, dataSeo, totalScore}
}

export default useCheckSeo