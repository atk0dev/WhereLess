import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(objects, inputName, objectName) {
    return objects.map(obj => {
        return `
      <a href="/${objectName}/${obj.slug}" class="${inputName}__result" data-${objectName}-id="${obj.id}">
        <strong data-${objectName}-id="${obj.id}">${obj.name}</strong>
      </a>
    `;
    }).join('');
}

function typeAhead(search, inputName, selectedName, objectName) {
    
    if (!search) return;

    const searchInput = search.querySelector(`input[name="${inputName}"]`);
    const searchResults = search.querySelector(`.${inputName}__results`);

    if (selectedName) {
        searchResults.on('click', function(e) {
            e.preventDefault();
            var objectId = e.target.getAttribute(`data-${objectName}-id`);
            searchInput.value = e.target.innerText;
            searchResults.style.display = 'none';
            search.querySelector(`.${selectedName}`).value = objectId;
        });
    }

    searchInput.on('input', function() {
        // if there is no value, quit it!
        if (!this.value) {
            searchResults.style.display = 'none';
            return; // stop!
        }

        // show the search results!
        searchResults.style.display = 'block';

        axios
            .get(`/api/search${objectName}?q=${this.value}`)
            .then(res => {
                if (res.data.length) {
                    searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data, inputName, objectName));
                    return;
                }
                // tell them nothing came back
                searchResults.innerHTML = dompurify.sanitize(`<div class="${inputName}__result">No results for ${this.value}</div>`);
            })
            .catch(err => {
                console.error(err);
            });
    });

    // handle keyboard inputs
    searchInput.on('keyup', (e) => {
        // if they aren't pressing up, down or enter, who cares!
        if (![38, 40, 13].includes(e.keyCode)) {
            return; // nah
        }
        const activeClass = `${inputName}__result--active`;
        const current = search.querySelector(`.${activeClass}`);
        const items = search.querySelectorAll(`.${inputName}__result`);
        let next;
        if (e.keyCode === 40 && current) {
            next = current.nextElementSibling || items[0];
        } else if (e.keyCode === 40) {
            next = items[0];
        } else if (e.keyCode === 38 && current) {
            next = current.previousElementSibling || items[items.length - 1]
        } else if (e.keyCode === 38) {
            next = items[items.length - 1];
        } else if (e.keyCode === 13 && current.href) {
            window.location = current.href;
            return;
        }
        if (current) {
            current.classList.remove(activeClass);
        }
        next.classList.add(activeClass);
    });
}

export default typeAhead;