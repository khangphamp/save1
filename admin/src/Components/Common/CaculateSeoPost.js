import { Button } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import {
  CheckSquareOutlined,
  CloseSquareOutlined,
} from "@ant-design/icons";
import useCheckSeo from '../Hooks/useCheckSeo'


function CaculateSeoPost({formData, descriptionData, editorContentRef}) {
  const {dataSeo,handleCheck,totalScore} = useCheckSeo({formData, descriptionData, editorContentRef})

  return (
    <div>
      <span style={{background: "#4ab147"}} className="p-2 text-white">{totalScore + '/100'}</span>
      <div className="mt-3">
      {dataSeo.map(item => {
        return (
          <div key={item.id} className="flex gap-2 items-center">
            {item.status?
              <CheckSquareOutlined  style={{color: 'green'}} fontSize={25}/>
              :
              <CloseSquareOutlined style={{color: 'red'}} fontSize={25}/>
            }
            <span className="text-base">{item.name}</span>
          </div>
        )
      })}
      </div>
     
      <Button type="primary" onClick={() => handleCheck(false)}>
        Kiểm tra SEO
      </Button>
    </div>
  )
}

export default CaculateSeoPost