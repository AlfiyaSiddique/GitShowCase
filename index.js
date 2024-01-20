const rootRoute = "https://api.github.com/users/";
let totalReposOfUser = 0;
let numberOfRepoPerPage = document.getElementById("reponumber").value;
let activePageId = "page1";

const getRequest = async (url) => {
  let response = await fetch(url);
  if (response.status === 200) {
    response = await response.json();
  } else {
    response = false;
  }
  return response;
};

const populateProfile = (data) => {
  const contentPart1 = `<div class="d-flex md:flex-wrap flex-row mb-3 ">
  <div class="p-2"><img src="${data.img}" class='profile' alt="${data.name}-profile"></div>
  <div class="d-flex flex-column mb-3">
      <div class="p-2 username">${data.name}</div>
      <div class="p-2">${data.bio}</div>`;

  const contentPart2 = `<div class="p-2"><i class="fa fa-map-marker pe-3"></i>${data.location}</div>
  <a class='link' target='_blank' href='https://twitter.com/${data.twitter}'class="p-2"><i class="fa fa-twitter pe-3"></i>https://twitter.com/${data.twitter}</a>`;

  const footer = `</div>
</div>
<a target='_blank' href='${data.github}' class='link'><i class="fa fa-github pe-3"></i>${data.github}</a>
`;
  let html =
    data.twitter && data.location
      ? contentPart1 + contentPart2 + footer
      : contentPart1 + footer;
  document.getElementById("profile").innerHTML = html;
};

const returnTopicElement = (topic) => {
  if (topic.length <= 0) return " ";
  let template = ``;
  for (let i = 0; i < topic.length; i++) {
    template += `<li class='topic'>${topic[i]}</li>`;
  }
  return template;
};

const generateTemplate = (repo1, repo2) => {
  const topic1 = returnTopicElement(repo1.topics);
  const topic2 = returnTopicElement(repo2.topics);

  const template = `<div class="d-flex flex-wrap flex-row justify-content-between mb-3">
                    <a href= '${repo1.link}' target='_blank'><div class="p-2 card">
                        <div class='card-title'>${repo1.name}</div>
                        <div>${
                          repo1.description !== null && repo1.description
                        }</div>
                         <ul class='d-flex flex-wrap flex-row ps-0'>
                            ${topic1 !== null && topic1}
                         </ul>
                    </div></a>
                    <a href= '${repo1.link}' target='_blank'><div class="p-2 card">
                    <div class='card-title'>${repo2.name}</div>
                    <div>${repo2.description}</div>
                     <ul class='d-flex flex-wrap flex-row ps-0'>
                        ${topic2 !== null && topic2}
                     </ul>
                    </div></a>
                </div>`;
  return template;
};

const populateRepositories = (data) => {
  let content = "";
  let i = 0;
  let oddObj = null;
  let oddTemplate = "";

  if (data.length % 2 !== 0) {
    oddObj = data[data.length - 1];
   let topic = returnTopicElement(oddObj.topics)
    data = data.slice(0, data.length - 1);
    oddTemplate = `
    <a href= '${oddObj.html_url}' target='_blank'><div class="p-2 card">
                        <div class='card-title'>${oddObj.name}</div>
                        <div>${
                          oddObj.description !== null && oddObj.description
                        }</div>
                         <ul class='d-flex flex-wrap flex-row ps-0'>
                            ${topic !== null && topic}
                         </ul>
                    </div></a>
    
    `;
  }

  while (i < data.length) {
    const limitedData = data.slice(i, i + 2).map((repo) => {
      return {
        name: repo.name,
        description: repo.description || " ",
        topics: repo.topics || [],
        link: repo.html_url
      };
    });
    const template = generateTemplate(limitedData[0], limitedData[1]);
    content += template;
    i += 2;
  }

  document.getElementById("repo-list").innerHTML = content+oddTemplate;
};

function pageClick() {
  Array.from(document.getElementsByClassName("page-link")).forEach((page) => {
    page.addEventListener("click", (e) => {
      document.getElementById(activePageId).classList.remove("active");
      page.classList.add("active");
      activePageId = page.id;
      let number = parseInt(page.innerText);
      if (page.id == "page1") {
        populateRepositories(
          totalReposOfUser.slice(0, numberOfRepoPerPage)
        );
        return;
      }
      populateRepositories(
        totalReposOfUser.slice(
          (numberOfRepoPerPage* number) - numberOfRepoPerPage,
          numberOfRepoPerPage* number
        )
      );
    });
  });
}

const addPagination = (divide) => {
  const start = `<li class="page-item"><a class="page-link" >Previ</a></li>`;
  let pages = "";
  let pagination = Math.ceil(totalReposOfUser.length / divide);
  for (let i = 1; i <= pagination; i++) {
    let active = i == 1 ? "active" : "";
    pages += `<li class="page-item"><a id='page${i}' class="page-link ${active}">${i}</a></li>`;
  }
  const end = `<li class="page-item"><a class="page-link">Next</a></li>`;
  let content = pages;
  if (pagination > 10) {
    content = start + content + end;
  }
  document.getElementById("pagelist").innerHTML = content;
  document.getElementById("page1").classList.add("active");
};

document.getElementById("search").addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    const response = await getRequest(`${rootRoute}${e.target.value}`);
    if (response) {
      totalReposOfUser = response.public_repos;
      const data = {
        img: response.avatar_url,
        bio: response.bio || "No Bio Given",
        name: response.name || "No Name provided",
        location: response.location,
        github: response.html_url,
        twitter: response.twitter_username,
      };
      document.getElementById("hero").style.display = "none";
      document.getElementById("main").style.display = "block";
      populateProfile(data);
      let getRepos = await getRequest(
        `${rootRoute}${response.login}/repos?type=public&per_page=${totalReposOfUser}`
      );
      getRepos = getRepos.filter((repo) => repo.fork === false);
      totalReposOfUser = getRepos;
      addPagination(10);
      pageClick();
      populateRepositories(getRepos.slice(0, numberOfRepoPerPage));
    }
  }
});

document.getElementById("reponumber").addEventListener("change", (e) => {
  addPagination(e.target.value);
  pageClick();
  numberOfRepoPerPage = e.target.value;
  populateRepositories(totalReposOfUser.slice(0, e.target.value));
});
