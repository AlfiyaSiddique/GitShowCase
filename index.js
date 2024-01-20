const rootRoute = "https://api.github.com/users/";

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
  document.getElementById("profile").innerHTML = `
    <div class="d-flex md:flex-wrap flex-row mb-3 ">
                <div class="p-2"><img src="${data.img}" class='profile' alt="${data.name}-profile"></div>
                <div class="d-flex flex-column mb-3">
                    <div class="p-2 username">${data.name}</div>
                    <div class="p-2">${data.bio}</div>
                    <div class="p-2"><i class="fa fa-map-marker pe-3"></i>${data.location}</div>
                    <a href='https://twitter.com/${data.twitter}'class="p-2"><i class="fa fa-twitter pe-3"></i>https://twitter.com/${data.twitter}</a>
                </div>
            </div>
            <a href='${data.github}'><i class="fa fa-github pe-3"></i>${data.github}</a>
    `;
};

const returnTopicElement = (topic) => {
    if(topic.length <= 0) return ' '
  let template = ``;
  for(let i = 0; i<topic.length; i++){
      template += `<li class='topic'>${topic[i]}</li>`;
      console.log(template)
  };
  return template;
};

const generateTemplate = (repo1, repo2) => {
  const topic1 = returnTopicElement(repo1.topics);
  const topic2 = returnTopicElement(repo2.topics);
  console.log(topic1)
  console.log(topic2)
  const template = `<div class="d-flex flex-wrap flex-row justify-content-between mb-3">
                    <div class="p-2 card">
                     <div class='card-body'>
                        <div class='card-title'>${repo1.name}</div>
                        <div>${repo1.description}</div>
                         <ul>
                            ${topic1}
                         </ul>
                         </div>
                    </div>
                    <div class="p-2 card">
                    <div class='card-title'>${repo2.name}</div>
                    <div>${repo2.description}</div>
                     <ul>
                        ${topic2}
                     </ul>
                    </div>
                </div>`;
  console.log(template);
  return template;
};

const populateRepositories = (data) => {
  let content = '';
  let i = 0;

  while (i < data.length) {
    const template = generateTemplate(data[i], data[i + 1]);
     content += template
    i += 2;
  }

  document.getElementById('repo-list').innerHTML = content
};

document.getElementById("search").addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    const response = await getRequest(`${rootRoute}${e.target.value}`);
    if (response) {
      const data = {
        img: response.avatar_url,
        bio: response.bio,
        name: response.name,
        location: response.location,
        github: response.html_url,
        twitter: response.twitter_username,
      };
      document.getElementById("hero").style.display = "none";
      const getRepos = getRequest(
        `${rootRoute}${response.login}/repos?type=public&per_page=10`
      );
      populateProfile(data);
      getRepos
        .then((res) => {
          console.log(res);
          populateRepositories(res);
        })
        .catch(() => {});
    }
  }
});
