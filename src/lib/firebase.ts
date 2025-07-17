// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, get } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCK5S8EFOZw2LHoDGredPU_7Gn-O6SFnFM",
  authDomain: "stocktaking-5b7a8.firebaseapp.com",
  databaseURL: "https://stocktaking-5b7a8-default-rtdb.firebaseio.com",
  projectId: "stocktaking-5b7a8",
  storageBucket: "stocktaking-5b7a8.firebasestorage.app",
  messagingSenderId: "57929272541",
  appId: "1:57929272541:web:53c593fe82a955d1805f34",
  measurementId: "G-B11FLLM5XR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);

// 🔥 直接获取Firebase数据的函数
export const fetchHRData = async () => {
  try {
    console.log('🔄 正在连接Firebase...');
    console.log('🔍 测试URL:', 'https://stocktaking-5b7a8-default-rtdb.firebaseio.com/.json');
    
    // 先尝试简单的REST API调用
    const response = await fetch('https://stocktaking-5b7a8-default-rtdb.firebaseio.com/.json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🌐 REST API响应状态:', response.status);
    console.log('🌐 响应头:', response.headers.get('content-type'));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP错误响应:', errorText);
      throw new Error(`HTTP错误: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ 成功获取Firebase数据!');
    console.log('📊 数据类型:', typeof data);
    
    if (data && typeof data === 'object') {
      const keys = Object.keys(data);
      console.log('📦 数据键值:', keys);
      
      // 检查是否有HR相关数据
      if (data.Absenteeism || data.Payment || data.Overtime || data.Budget) {
        console.log('🎯 找到HR数据结构!');
        console.log('- 缺勤数据:', !!data.Absenteeism, data.Absenteeism ? Object.keys(data.Absenteeism).length + '个部门' : '');
        console.log('- 薪资数据:', !!data.Payment, data.Payment ? Object.keys(data.Payment).length + '个部门' : '');
        console.log('- 加班数据:', !!data.Overtime, data.Overtime ? Object.keys(data.Overtime).length + '个部门' : '');
        console.log('- 预算数据:', !!data.Budget, data.Budget ? Object.keys(data.Budget).length + '个部门' : '');
        
        return [data];
      } else {
        console.log('⚠️ 数据结构不是预期的HR格式，但仍返回数据:', keys);
        return [data];
      }
    } else if (data === null) {
      console.log('⚠️ Firebase返回null - 数据库可能为空');
      return [];
    } else {
      console.log('⚠️ 数据格式异常:', data);
      return [];
    }
  } catch (error) {
    console.error('❌ Firebase连接详细错误信息:');
    console.error('- 错误类型:', error.constructor.name);
    console.error('- 错误消息:', error.message);
    console.error('- 完整错误:', error);
    
    // 如果是网络错误，提供更详细的信息
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接失败 - 请检查网络连接或Firebase数据库权限设置');
    } else {
      throw new Error(`Firebase连接失败: ${error.message}`);
    }
  }
};

// 🔄 实时监听函数
export const listenToHRData = (callback: (data: any) => void) => {
  console.log('🚀 启动Firebase实时监听...');
  
  const dbRef = ref(database);
  const unsubscribe = onValue(dbRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('🔄 数据实时更新!', Object.keys(data));
      callback([data]);
    } else {
      console.log('⚠️ 监听到空数据');
      callback([]);
    }
  }, (error) => {
    console.error('❌ 实时监听错误:', error);
    callback([]);
  });
  
  return unsubscribe;
};

// 🔼 上传HR数据到Firebase
export const uploadHRData = async (data: any) => {
  try {
    console.log('📤 正在上传HR数据到Firebase...');
    const response = await fetch('https://stocktaking-5b7a8-default-rtdb.firebaseio.com/hrData.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP错误! 状态: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ HR数据上传成功');
    return result;
  } catch (error) {
    console.error('❌ HR数据上传失败:', error);
    throw error;
  }
};

// 🔼 添加单个HR记录
export const addHRRecord = async (record: any) => {
  try {
    console.log('📤 正在添加HR记录...');
    const timestamp = new Date().toISOString();
    const recordWithTimestamp = { ...record, timestamp };
    
    const response = await fetch('https://stocktaking-5b7a8-default-rtdb.firebaseio.com/hrData.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recordWithTimestamp),
    });

    if (!response.ok) {
      throw new Error(`HTTP错误! 状态: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ HR记录添加成功');
    return result;
  } catch (error) {
    console.error('❌ HR记录添加失败:', error);
    throw error;
  }
};

export { database, analytics };