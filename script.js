document.addEventListener("DOMContentLoaded", () => {
    
    function animateValue(obj, start, end, duration) {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * (end - start) + start);
            if (obj.id === "calc-display" && !isNaN(end)) {
                obj.innerText = `Результат: ${currentValue}`;
            } else { obj.innerText = currentValue; }
            if (progress < 1) { window.requestAnimationFrame(step); } 
            else {
                if (obj.id === "calc-display") {
                    obj.innerText = typeof end === 'number' ? `Результат: ${end}` : end;
                } else { obj.innerText = end; }
            }
        };
        window.requestAnimationFrame(step);
    }

    const n1 = document.getElementById("num1");
    const n2 = document.getElementById("num2");
    const display = document.getElementById("calc-display");
    let lastCalcValue = 0;

    if (n1 && n2 && display) {
        document.querySelectorAll(".calc-btn-action").forEach(btn => {
            btn.onclick = () => {
                const v1 = parseFloat(n1.value); const v2 = parseFloat(n2.value);
                const op = btn.getAttribute("data-op");
                if (isNaN(v1) || isNaN(v2)) { display.innerText = "Введите оба числа!"; return; }
                let res = 0;
                if (op === "+") res = v1 + v2;
                if (op === "-") res = v1 - v2;
                if (op === "*") res = v1 * v2;
                if (op === "/") res = v2 !== 0 ? v1 / v2 : "Деление на 0!";

                if (typeof res === 'number') {
                    animateValue(display, lastCalcValue, res, 400); lastCalcValue = res;
                } else { display.innerText = res; lastCalcValue = 0; }
            };
        });
        const cylBtn = document.getElementById("btn-cylinder");
        if (cylBtn) {
            cylBtn.onclick = () => {
                const r = parseFloat(n1.value); const h = parseFloat(n2.value);
                if (isNaN(r) || isNaN(h) || r <= 0 || h <= 0) { display.innerText = "Введите корректные R и H!"; return; }
                const volume = Math.PI * Math.pow(r, 2) * h;
                display.innerText = `V цилиндра = ${volume.toFixed(2)}`; lastCalcValue = 0;
            };
        }
    }

    const cartList = document.getElementById("cart-list");
    const totalPriceSpan = document.getElementById("total-price");
    const checkoutBtn = document.getElementById("checkout-btn");
    const warningBox = document.getElementById("min-price-warning");
    window.cart = {}; window.lastTotalValue = 0; 

    if (cartList && totalPriceSpan) {
        document.querySelectorAll(".order-btn").forEach(btn => {
            btn.onclick = (e) => {
                const item = e.target.closest(".menu-item");
                const name = item.querySelector("h3").innerText;
                const price = parseInt(item.getAttribute("data-price"));
                if (window.cart[name]) { window.cart[name].count += 1; } 
                else { window.cart[name] = { price: price, count: 1 }; }
                renderCart();
            };
        });
        function renderCart() {
            cartList.innerHTML = ""; let total = 0; const keys = Object.keys(window.cart);
            if (keys.length === 0) {
                cartList.innerHTML = '<li style="color: #7f8c8d;">Ничего не выбрано</li>';
                animateValue(totalPriceSpan, window.lastTotalValue, 0, 300); window.lastTotalValue = 0;
                if (checkoutBtn) checkoutBtn.disabled = true;
                if (warningBox) warningBox.style.display = "block"; return;
            }
            keys.forEach(name => {
                const cost = window.cart[name].price * window.cart[name].count; total += cost;
                const li = document.createElement("li");
                li.style.padding = "8px 0"; li.style.display = "flex"; li.style.justifyContent = "space-between";
                li.style.opacity = "0"; li.style.transform = "translateX(-10px)"; li.style.transition = "all 0.3s ease";
                li.innerHTML = `
                    <span> ${name} x${window.cart[name].count}</span>
                    <span><b>${cost} руб.</b> <button class="del-btn" data-name="${name}" style="padding:2px 6px; background:#e74c3c; color:#fff; border:none; border-radius:4px; margin-left:10px; cursor:pointer;">❌</button></span>
                `;
                cartList.appendChild(li);
                setTimeout(() => { li.style.opacity = "1"; li.style.transform = "translateX(0)"; }, 10);
            });
            animateValue(totalPriceSpan, window.lastTotalValue, total, 400); window.lastTotalValue = total;
            if (total < 1000) {
                if (warningBox) warningBox.style.display = "block"; if (checkoutBtn) checkoutBtn.disabled = true;
            } else {
                if (warningBox) warningBox.style.display = "none"; if (checkoutBtn) checkoutBtn.disabled = false;
            }
            document.querySelectorAll(".del-btn").forEach(delBtn => {
                delBtn.onclick = () => {
                    const name = delBtn.getAttribute("data-name"); window.cart[name].count -= 1;
                    if (window.cart[name].count <= 0) delete window.cart[name];
                    renderCart();
                };
            });
        }
    }


    const checkoutBtnGlobal = document.getElementById("checkout-btn");
    if (checkoutBtnGlobal) {
        checkoutBtnGlobal.onclick = () => {
            const SUPABASE_URL = "https://kduqslslkmnplkrzqtcu.supabase.co";
            const SUPABASE_KEY = "sb_publishable_2-sxbPdkLTUvRpmdjyx7fw_P0kRKsKF";

            fetch(`${SUPABASE_URL}/rest/v1/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify({
                    total_price: window.lastTotalValue,
                    items: window.cart
                })
            })
            .then(res => {
                if (res.status === 201 || res.status === 200) {
                    alert("Заказ успешно сохранен");
                    window.cart = {}; document.getElementById("cart-list").innerHTML = '<li style="color: #7f8c8d;">Ничего не выбрано</li>';
                    document.getElementById("total-price").innerText = "0"; window.lastTotalValue = 0;
                    if (document.getElementById("checkout-btn")) document.getElementById("checkout-btn").disabled = true;
                    if (document.getElementById("min-price-warning")) document.getElementById("min-price-warning").style.display = "block";
                } else { alert("Ошибка отправки. Проверьте настройки таблицы orders."); }
            })
            .catch(err => alert("Ошибка сети при отправке"));
        };
    }
    const form = document.getElementById("user-form");
    const resultBox = document.getElementById("form-results");
    const resultContent = document.getElementById("results-content");

    if (form && resultBox && resultContent) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const fio = document.getElementById("fio").value; const dobValue = document.getElementById("dob").value;
            const email = document.getElementById("email").value; const phone = document.getElementById("phone").value;
            const bio = document.getElementById("bio").value;

            const birthDate = new Date(dobValue); const today = new Date();
            const centenaryDate = new Date(birthDate.getFullYear() + 100, birthDate.getMonth(), birthDate.getDate());
            const diffDays = Math.ceil((centenaryDate - today) / (1000 * 60 * 60 * 24));
            let daysText = diffDays > 0 ? `До 100-летия осталось: <b>${diffDays} дней</b>!` : `Вы уже празднуете свой вековой юбилей!`;

            resultContent.innerHTML = `
                <p><strong>Результаты обработки анкеты:</strong></p>
                <ul style="list-style-type: square; padding-left: 20px; margin-top: 10px;">
                    <li><b>ФИО:</b> ${fio}</li><li><b>Дата рождения:</b> ${birthDate.toLocaleDateString('ru-RU')}</li>
                    <li><b>Email:</b> ${email}</li><li><b>Телефон:</b> ${phone || "Не указан"}</li><li><b>О себе:</b> ${bio || "Пусто"}</li>
                </ul>
                <div style="background-color: #fffde7; border-left: 4px solid #f1c40f; padding: 10px; font-size: 15px; margin-top: 10px; border-radius: 4px; color: #333;">⏰ ${daysText}</div>
            `;
            resultBox.style.display = "block"; resultBox.style.opacity = "0"; resultBox.style.transform = "scale(0.95)";
            resultBox.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            setTimeout(() => { resultBox.style.opacity = "1"; resultBox.style.transform = "scale(1)"; }, 50);

            const SUPABASE_URL = "https://kduqslslkmnplkrzqtcu.supabase.co";
            const SUPABASE_KEY = "sb_publishable_2-sxbPdkLTUvRpmdjyx7fw_P0kRKsKF";

            fetch(`${SUPABASE_URL}/rest/v1/anketa`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify({ fio: fio, dob: dobValue, email: email, phone: phone, bio: bio })
            })
            .then(res => console.log("Анкета успешна сохранена Status:", res.status))
            .catch(err => console.error("Ошибка сети анкеты:", err));

            form.reset(); resultBox.scrollIntoView({ behavior: 'smooth' });
        };
    }

    initSchedule();
});

function initSchedule() {
    const items = document.querySelectorAll(".discipline-clickable, [data-info]");
    
   
    let overlay = document.getElementById("schedule-modal");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "schedule-modal";
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header" id="modal-title">Дисциплина</div>
                <div class="modal-body" id="modal-text">Информация</div>
                <button class="modal-close-btn" id="modal-close">Понятно</button>
            </div>
        `;
        document.body.appendChild(overlay);

        
        overlay.querySelector("#modal-close").onclick = () => overlay.classList.remove("active");
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.classList.remove("active");
        };
    }

    items.forEach(item => {
        item.style.cursor = "pointer";
        item.onclick = (e) => {
            e.preventDefault();
            const disciplineName = item.innerText || item.textContent;
            const info = item.getAttribute("data-info");
           
            document.getElementById("modal-title").innerText = disciplineName.trim();
            document.getElementById("modal-text").innerHTML = info 
                ? `<b>Форма контроля:</b> ${info}` 
                : `Дополнительная информация пока не заполнена в HTML для этого предмета.`;
            
            
            overlay.classList.add("active");
        };
    });
}


const weatherWidget = document.getElementById("weather-loading-text");
async function loadWeather() {
    try {
        
        const response = await fetch('./weather.json');
        const data = await response.json();
        
        
        const weatherElement = document.getElementById('weather');
        if (weatherElement) {
            weatherElement.innerText = `${data.temperature}`;
        }
    } catch (error) {
        console.error('Не удалось загрузить сохраненную погоду:', error);
    }
}


document.addEventListener('DOMContentLoaded', loadWeather);


