


class Article {
  constructor(title, content, writer, likeCount = 0) {
    this._title = title;
    this._content = content;
    this._writer = writer;
    this._likeCount = likeCount;
    this._createdAt = new Date()
  }

  like() {
    this._likeCount += 1;
  }
}



const articleurl = new URL('https://panda-market-api-crud.vercel.app/articles');

export async function getArticlelist(page, pageSize, keyword) {

  const articleListUrl = new URL(articleurl);
  if (page !== null && page !== undefined) {
    articleListUrl.searchParams.set('page', page);
  }
  if (pageSize !== null && pageSize !== undefined) {

    articleListUrl.searchParams.set('pageSize', pageSize)
  }
  if (keyword !== null && keyword !== undefined) {
    articleListUrl.searchParams.set('keyword', keyword);
  }
  return fetch(articleListUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('데이터를 가져오는 중 오류 발생:', error);
    });
}



export async function getArticle(id) {
  const articlesurl = new URL(`${articleurl}/${id}`);
  return fetch(articlesurl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('데이터를 가져오는 중 오류 발생:', error);
    });
}



export async function createArticle({ title, content, image }) {
  return fetch(articleurl, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, content, image })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('데이터를 가져오는 중 오류 발생:', error);
    });
}




export async function patchArticle(id, { params }) {
  const patchurl = new URL(`${articleurl}/${id}`);
  return fetch(patchurl, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ params })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('데이터를 가져오는 중 오류 발생:', error);
    });
}


export async function deleteArticle(id) {
  const deleteurl = `${articleurl}/${id}`;
  return fetch(deleteurl, {
    method: "DELETE"
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('데이터를 가져오는 중 오류 발생:', error);
    });
}

const articleApi = { Article, getArticle, getArticlelist, patchArticle, deleteArticle, createArticle }

export default articleApi

