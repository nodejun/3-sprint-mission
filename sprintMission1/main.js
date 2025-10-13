import productApi from './ProductService.js';

import articleApi from './ArticleService.js';

//getProduct로 콘솔에 출력해보기
// await productApi.getProduct(888)


//getpatchproduct이용해보기

await productApi.patchProduct(885, { price: 333 })


//createProduct 사용해보기

await productApi.createProduct({
  name: 'jun',
  description: '무거움',
  tags: [],
  images: [],
  price: 30000
})


//deleteProduct사용해보기

// await productApi.deleteProduct(889)


//--------------------------article---------------------------

//getarticleList 사용해보기

await articleApi.getArticlelist(1, 10, "")


// //get article 시용해보기

await articleApi.getArticle(141)


// //createarticle 사용해보기

await articleApi.createArticle({
  title: '오류좀',
  content: '죽인다',
  image: 'https://example.com/...'
})


// //patcharticle 사용해보기

await articleApi.patchArticle(141, { title: '넌또뭐야' })


// //deletearticle 사용해보기

// await articleApi.deleteArticle(144)

const pandalist = await productApi.getProductList()

const products = [];

let manufacturer = ""

for (const marketlist of pandalist.list) {
  let product;
  if (marketlist.tags.includes("전자제품")) {
    product = new productApi.ElectronicProduct({
      ...marketlist,
      manufacturer: manufacturer
    })
  } else {
    product = new productApi.Product({
      ...marketlist
    })
  }
  products.push(product)
}

console.log(products)

