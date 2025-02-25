// Глобальные переменные
let filmsData = [];
let currentPage = 1;
const filmsPerPage = 12;
let filteredFilms = [];

// Загрузка данных из JSON-файла
async function loadFilmsData() {
    try {
        const response = await fetch('films.json');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        
        filmsData = await response.json();
        filteredFilms = [...filmsData];
        
        // Заполняем фильтр годов
        populateYearFilter();
        
        // Отображаем фильмы
        displayFilms();
        
    } catch (error) {
        console.error('Error loading films data:', error);
        document.getElementById('filmsGrid').innerHTML = `
            <div class="error">Error loading data. Please try again later.</div>
        `;
    }
}

// Заполнение фильтра годов уникальными значениями
function populateYearFilter() {
    const yearFilter = document.getElementById('yearFilter');
    
    // Получаем уникальные годы
    const years = [...new Set(filmsData.map(film => film.release_year))].filter(year => year !== null);
    
    // Сортируем годы по убыванию (от новых к старым)
    years.sort((a, b) => b - a);
    
    // Добавляем опции в селект
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

// Отображение фильмов с учетом пагинации
function displayFilms() {
    const filmsGrid = document.getElementById('filmsGrid');
    const startIndex = (currentPage - 1) * filmsPerPage;
    const endIndex = startIndex + filmsPerPage;
    const filmsToDisplay = filteredFilms.slice(startIndex, endIndex);
    
    // Очищаем текущее содержимое
    filmsGrid.innerHTML = '';
    
    if (filmsToDisplay.length === 0) {
        filmsGrid.innerHTML = '<div class="no-results">No films found matching your criteria.</div>';
        return;
    }
    
    // Добавляем карточки фильмов
    filmsToDisplay.forEach(film => {
        const filmCard = document.createElement('div');
        filmCard.className = 'film-card';
        
        filmCard.innerHTML = `
            <div class="film-info">
                <h3 class="film-title">${film.title}</h3>
                <div class="film-year">${film.release_year || 'Unknown Year'}</div>
                <div class="film-director">Director: ${film.directors || 'Unknown'}</div>
                <div class="film-box-office">Box Office: ${film.box_office || 'Unknown'}</div>
                <div class="film-country">Country: ${film.country || 'Unknown'}</div>
            </div>
        `;
        
        filmsGrid.appendChild(filmCard);
    });
    
    // Обновляем состояние кнопок пагинации
    updatePaginationButtons();
}

// Обновление состояния кнопок пагинации
function updatePaginationButtons() {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= Math.ceil(filteredFilms.length / filmsPerPage);
    
    currentPageSpan.textContent = `Page ${currentPage} of ${Math.max(1, Math.ceil(filteredFilms.length / filmsPerPage))}`;
}

// Применение фильтров и сортировки
function applyFiltersAndSort() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const yearFilter = document.getElementById('yearFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // Фильтрация
    filteredFilms = filmsData.filter(film => {
        // Поиск по названию
        const matchesSearch = film.title.toLowerCase().includes(searchTerm);
        
        // Фильтр по году
        const matchesYear = yearFilter === 'all' || film.release_year == yearFilter;
        
        return matchesSearch && matchesYear;
    });
    
    // Сортировка
    filteredFilms.sort((a, b) => {
        switch (sortBy) {
            case 'box_office_desc':
                return (b.box_office_value || 0) - (a.box_office_value || 0);
            case 'box_office_asc':
                return (a.box_office_value || 0) - (b.box_office_value || 0);
            case 'year_desc':
                return (b.release_year || 0) - (a.release_year || 0);
            case 'year_asc':
                return (a.release_year || 0) - (b.release_year || 0);
            case 'title_asc':
                return a.title.localeCompare(b.title);
            case 'title_desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });
    
    // Сбрасываем на первую страницу при изменении фильтров
    currentPage = 1;
    
    // Отображаем отфильтрованные и отсортированные фильмы
    displayFilms();
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем данные при загрузке страницы
    loadFilmsData();
    
    // Обработчик поиска
    document.getElementById('searchInput').addEventListener('input', applyFiltersAndSort);
    
    // Обработчик фильтра по году
    document.getElementById('yearFilter').addEventListener('change', applyFiltersAndSort);
    
    // Обработчик сортировки
    document.getElementById('sortBy').addEventListener('change', applyFiltersAndSort);
    
    // Обработчики пагинации
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayFilms();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < Math.ceil(filteredFilms.length / filmsPerPage)) {
            currentPage++;
            displayFilms();
        }
    });
});
