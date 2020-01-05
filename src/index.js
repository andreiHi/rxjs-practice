import {EMPTY, fromEvent} from 'rxjs'
import {map, debounceTime, distinctUntilChanged, switchMap, mergeMap, tap, catchError, filter} from 'rxjs/operators'
import {ajax} from 'rxjs/ajax'

const url = 'https://api.github.com/search/users?q=';

const search = document.getElementById('search');
const result = document.getElementById('result');

const stream$ = fromEvent(search, 'input')
    .pipe(
        map(e => e.target.value), // преобразовывает полученные данные в строку из евента
        debounceTime(1000), // складывает в строку и ждет 1 сек послен последнего нажатия
        distinctUntilChanged(), // не отправляет запрос если значение не изменилось по сравнению с последним запросом
        tap(() => result.innerHTML = ''), // очищаем место вставки от предыдущих запросов
        filter(v => v.trim()),  // отфильтровывает пустые строки
        switchMap(v => ajax.getJSON(url + v).pipe(     // делаем запрос на сервер с учетом полученных данных из предыдущего стрима
            catchError(err => EMPTY) // завершает стрим вслучае ошибки
        )),
        map(response => response.items), //преобразовывает полученные данные к виду [{}, {}, {}] массив объектов
        mergeMap(items => items) // позволяет получить элемент массива как отдельный консоль лог
    );

stream$.subscribe(
    user => {
        console.log(user);
        const html =
            `<div class="card">
        <div class="card-image">
          <img src="${user.avatar_url}" />
          <samp class="card-title">${user.login}</samp>
        </div>
        <div class="card-action">
          <a href="${user.html_url}" target="_blank">Открыть GitHub</a>
        </div>
      </div>`;
        result.insertAdjacentHTML('beforeend', html);
    });