// Öğrenci verilerini tutacak dizi
let students = [];

// Sayfa yüklendiğinde localStorage'dan verileri yükle
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updateTitles();
});

// Başlıkları güncelleme fonksiyonu
function updateTitles() {
    const mainTitle = document.getElementById('mainTitle').value;
    const subTitle = document.getElementById('subTitle').value;
    
    // Tüm ana başlıkları güncelle
    document.querySelectorAll('.main-title').forEach(title => {
        title.textContent = mainTitle;
    });

    // Tüm alt başlıkları güncelle
    document.querySelectorAll('.criteria-header').forEach(header => {
        header.textContent = subTitle;
    });
}

// Input değişikliklerini dinle
document.getElementById('mainTitle').addEventListener('input', updateTitles);
document.getElementById('subTitle').addEventListener('input', updateTitles);

// Puanları kriterlere dağıtma fonksiyonu
function distributeCriteriaPoints(totalPoints) {
    // Her kritere 0 puan ile başla
    const scores = Array(10).fill(0);
    let remainingPoints = totalPoints;

    while (remainingPoints > 0) {
        // Puanı artırılabilecek kriterleri bul
        const availableCriteria = scores
            .map((score, index) => ({ index, score }))
            .filter(c => c.score < 10);

        if (availableCriteria.length === 0) break;

        // Rastgele bir kriter seç
        const randomCriterion = availableCriteria[Math.floor(Math.random() * availableCriteria.length)];
        
        // 5 veya 10 puan ekle
        const pointsToAdd = Math.min(
            Math.random() < 0.5 ? 5 : 10, // %50 olasılıkla 5 veya 10 puan
            remainingPoints,
            10 - scores[randomCriterion.index]
        );

        if (pointsToAdd > 0) {
            scores[randomCriterion.index] += pointsToAdd;
            remainingPoints -= pointsToAdd;
        }
    }

    // Kalan puanları 5'er 5'er dağıt
    while (remainingPoints >= 5) {
        const availableIndices = scores
            .map((score, index) => ({ index, score }))
            .filter(c => c.score < 10)
            .map(c => c.index);

        if (availableIndices.length === 0) break;

        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        scores[randomIndex] += 5;
        remainingPoints -= 5;
    }

    return scores;
}

// Yeni öğrenci ekleme
function addStudent() {
    const nameInput = document.getElementById('studentName');
    const book1Input = document.getElementById('book1Points');
    const book2Input = document.getElementById('book2Points');

    const name = nameInput.value.trim();
    const book1Total = parseInt(book1Input.value);
    const book2Total = parseInt(book2Input.value);

    // Form validasyonu
    if (!name) {
        alert('Lütfen öğrenci adını giriniz');
        return;
    }

    if (!book1Total || book1Total < 0 || book1Total > 100) {
        alert('1. Kitap için lütfen 0-100 arası puan giriniz');
        return;
    }

    if (!book2Total || book2Total < 0 || book2Total > 100) {
        alert('2. Kitap için lütfen 0-100 arası puan giriniz');
        return;
    }

    // Aynı isimde öğrenci kontrolü
    if (students.some(student => student.name === name)) {
        alert('Bu isimde bir öğrenci zaten mevcut');
        return;
    }

    // Öğrenciyi ekle (iki farklı kitap puanı ile)
    students.push({
        name,
        book1Scores: distributeCriteriaPoints(book1Total),
        book2Scores: distributeCriteriaPoints(book2Total)
    });

    // Tabloları güncelle ve kaydet
    updateTables();
    saveToLocalStorage();

    // Formları temizle
    nameInput.value = '';
    book1Input.value = '';
    book2Input.value = '';
}

// Tabloları güncelleme
function updateTables() {
    updateTable('book1TableBody', 'book1Scores');
    updateTable('book2TableBody', 'book2Scores');
}

// Tek bir tabloyu güncelleme
function updateTable(tableId, scoresKey) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;

    tbody.innerHTML = '';
    
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        
        // Öğrenci adı
        row.innerHTML = `<td>${student.name}</td>`;
        
        // Kriter puanları
        student[scoresKey].forEach(score => {
            row.innerHTML += `<td>${score}</td>`;
        });
        
        // Toplam puan
        const total = student[scoresKey].reduce((a, b) => a + b, 0);
        
        row.innerHTML += `
            <td>${total}</td>
            <td class="no-print">
                <button onclick="deleteStudent(${index})" class="delete-btn">Sil</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Öğrenci silme
function deleteStudent(index) {
    if (confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
        students.splice(index, 1);
        updateTables();
        saveToLocalStorage();
    }
}

// LocalStorage'a kaydetme
function saveToLocalStorage() {
    try {
        localStorage.setItem('students', JSON.stringify(students));
        localStorage.setItem('mainTitle', document.getElementById('mainTitle').value);
        localStorage.setItem('subTitle', document.getElementById('subTitle').value);
    } catch (error) {
        console.error('Veriler kaydedilirken hata oluştu:', error);
    }
}

// LocalStorage'dan yükleme
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('students');
        const mainTitle = localStorage.getItem('mainTitle');
        const subTitle = localStorage.getItem('subTitle');
        
        if (saved) {
            students = JSON.parse(saved);
            updateTables();
        }
        
        if (mainTitle) document.getElementById('mainTitle').value = mainTitle;
        if (subTitle) document.getElementById('subTitle').value = subTitle;
    } catch (error) {
        console.error('Veriler yüklenirken hata oluştu:', error);
        localStorage.removeItem('students');
        students = [];
    }
}

// Yazdırma fonksiyonu
function printTables() {
    window.print();
}

// Global fonksiyonları tanımla
window.addStudent = addStudent;
window.deleteStudent = deleteStudent;
window.printTables = printTables;