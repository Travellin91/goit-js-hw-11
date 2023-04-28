import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './fetchImages';
//import { Fluend_scroll } from './fluend_scroll'

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const arrowTop = document.querySelector('.arrow-top');
const perPage = 40;

let query = '';
let page = 1;
let simpleLightBox;

searchForm.addEventListener('submit', onSearchForm);
gallery.addEventListener('click', onGalleryClick);

//window.addEventListener('scroll', throttle(showLoadMorePage, 500));

function renderGallery(images) {
  const markup = images
    .map(
      ({
        id,
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
      <a class="gallery__link" href="${largeImageURL}">
        <div class="gallery-item" id="${id}">
          <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <p class="info-item"><b>Likes</b>${likes}</p>
            <p class="info-item"><b>Views</b>${views}</p>
            <p class="info-item"><b>Comments</b>${comments}</p>
            <p class="info-item"><b>Downloads</b>${downloads}</p>
          </div>
        </div>
      </a>
    `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

function onSearchForm(e) {
  e.preventDefault();
  page = 1;
  query = e.currentTarget.elements.searchQuery.value.trim();
  gallery.innerHTML = '';

  if (query === '') {
    Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
    );
    return;
  }

  fetchImages(query, page, perPage)
    .then(({ totalHits, hits }) => {
      if (totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        renderGallery(hits);
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      }
    })
    .catch(error => console.log(error))
    .then(() => {
      searchForm.reset();
    });
}

function onGalleryClick(e) {
  e.preventDefault();
  if (e.target.classList.contains('gallery-item__img')) {
    simpleLightBox.open(e.target.parentNode.href);
  }
}

function showLoadMorePage() {
  arrowTop.hidden = scrollY < document.documentElement.clientHeight;
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5 && query !== '') {
    onLoadMore();
  }
}

function onLoadMore() {
  page += 1;
  simpleLightBox.destroy();
}