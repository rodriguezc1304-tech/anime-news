fetch("news.json")
.then(response => response.json())
.then(data => {

document.getElementById("date").innerText =
"Actualizado: " + data.date;

const container = document.getElementById("news-container");

data.news.forEach((item, index) => {

container.innerHTML += `
<div class="card">
<h2>${index + 1}. ${item.title}</h2>
<p>${item.summary}</p>
<a href="${item.link}" target="_blank">
Leer noticia completa →
</a>
</div>
`;

});
});
