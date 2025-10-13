

import axios from "axios";


class Product {
  constructor({ name, description, price, tags = [], images = [], favoriteCount = 0 }) {
    this._name = name;
    this._description = description;
    this._price = price;
    this._tags = tags;
    this._images = images;
    this._favoriteCount = favoriteCount;
  }
  favorite() {
    this._favoriteCount += 1;
  }
}

class ElectronicProduct extends Product {
  constructor({ name, description, price, tags, images, manufacturer, favoriteCount = 0 }) {
    super({ name, description, price, tags, images, favoriteCount });
    this._manufacturer = manufacturer;
  }
}



const producturl = axios.create({
  baseURL: "https://panda-market-api-crud.vercel.app/products"
});

export async function getProductList(page, pageSize = 30, keyword = "") {
  try {
    const response = await producturl.get("/", {
      params: { page, pageSize, keyword }
    });
    return response.data;
  } catch (error) {
    console.log('오류가 발생하였습니다')
    console.error(`서버 오류 발생: ${error.response?.status} - ${error.response?.data?.message || '알 수 없는 오류'}`);
  }
}


export async function getProduct(id) {
  try {
    const response = await producturl.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.log('오류가 발생하였습니다')
    console.error(`서버 오류 발생: ${error.response.status} - ${error.response.data.message || '알 수 없는 오류'}`);
  }
}


export async function createProduct(name, description, price, tags, images) {
  try {
    const response = await producturl.post(`/`, {
      params: {
        name, description, price, tags, images
      }
    });
    return response.data;
  } catch (error) {
    console.log('오류가 발생하였습니다')
    console.error(`서버 오류 발생: ${error.response.status} - ${error.response.data.message || '알 수 없는 오류'}`);
  }
}



export async function patchProduct(id, params = {}) {
  try {
    const response = await producturl.patch(`/${id}`, {params});
    return response.data;
  } catch (error) {
    console.log('오류가 발생하였습니다')
    console.error(`서버 오류 발생: ${error.response.status} - ${error?.response.data.message || '알 수 없는 오류'}`);
  }
}



export async function deleteProduct(id) {
  try {
    const response = await producturl.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.log('오류가 발생하였습니다')
    console.error(`서버 오류 발생: ${error.response.status} - ${error.response.data.message || '알 수 없는 오류'}`);
  }
}



const productApi = { Product, ElectronicProduct, getProduct, getProductList, createProduct, patchProduct, deleteProduct }

export default productApi