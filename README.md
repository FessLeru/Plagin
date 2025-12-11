# Rocket Docker Compose Plugin

**Автор:** Седунов Андрей  
**Группа:** М3104  
**Лабораторная работа №3:** Создание плагина для IDE

---

## Описание

Плагин для Visual Studio Code, который отображает анимацию взлетающей ракеты во время выполнения команды `docker compose --build`. Ракета поднимается вверх по мере прогресса сборки, пламя анимируется.

```
       /\
      /  \
     |    |
     |    |
     |    |
    /|    |\
   / |    | \
  '--|    |--'
     |    |
    /      \
   '--------'
       ||
      /||\
     //||\\
      ****

[████████████░░░░░░░░░░░░░░░░░░] 30%
```

---

## Возможности

| Функция | Описание |
|---------|----------|
| Анимация ракеты | Ракета поднимается вверх по мере сборки |
| Анимация пламени | Пламя двигателя меняется каждые 300мс |
| Прогресс-бар | Визуальный индикатор прогресса сборки |
| Автоопределение | Автоматически определяет команды docker compose build/up |
| Команды | Ручной запуск через Command Palette |

---

## Структура проекта

```
RocketDockerPlugin/
├── package.json          # Манифест плагина VS Code
├── extension.js          # Основной код плагина
├── docker-compose.yml    # Тестовый Docker Compose
├── Dockerfile            # Тестовый Dockerfile
├── app/
│   └── index.html        # Тестовая страница
├── .vscodeignore         # Исключения при упаковке
└── README.md             # Документация
```

---

## Архитектура плагина

### Компоненты

```
┌─────────────────────────────────────────────────────────┐
│                    VS Code Extension                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │   activate() │───>│ Terminal     │───>│ Output    │  │
│  │              │    │ Listener     │    │ Channel   │  │
│  └──────────────┘    └──────────────┘    └───────────┘  │
│         │                   │                   │        │
│         v                   v                   v        │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │  Commands    │    │ Task         │    │ ASCII     │  │
│  │  Registration│    │ Listener     │    │ Animation │  │
│  └──────────────┘    └──────────────┘    └───────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Точки расширения VS Code

1. **activationEvents** - плагин активируется при старте VS Code
2. **contributes.commands** - регистрация команд в Command Palette
3. **OutputChannel** - вывод анимации в консоль Output

### Жизненный цикл

```
1. VS Code запускается
         │
         v
2. activate() вызывается
         │
         v
3. Регистрация слушателей терминала
         │
         v
4. Пользователь вводит "docker compose --build"
         │
         v
5. Определение команды --> Открытие Output Channel
         │
         v
6. Анимация ракеты + Прогресс-бар
         │
         v
7. Завершение сборки --> Ракета наверху
```

---

## Установка и запуск

### Требования

- Visual Studio Code 1.74.0+
- Node.js 16+
- Docker и Docker Compose (для тестирования)

### Установка для разработки

```bash
git clone https://github.com/FessLeru/rocket-docker-compose.git
cd rocket-docker-compose
npm install
code .
```

### Запуск в режиме отладки

1. Откройте проект в VS Code
2. Нажмите F5 или выберите Run > Start Debugging
3. Откроется новое окно VS Code с загруженным плагином

### Тестирование

```bash
docker compose build

# Или через Command Palette (Ctrl+Shift+P):
> Show Rocket Animation
```

---

## Сборка и публикация

### Упаковка в .vsix

```bash
npm install -g @vscode/vsce
vsce package
```

### Установка локально

```bash
code --install-extension rocket-docker-compose-1.0.0.vsix
```

---

## Использование

### Автоматический режим

Выполните в терминале:
```bash
docker compose build
docker compose up --build
docker-compose build
```

Ракета появится автоматически.

### Ручной режим

1. Откройте Command Palette: Ctrl+Shift+P (Windows/Linux) или Cmd+Shift+P (macOS)
2. Введите: Show Rocket Animation

---

## Технические детали

### API VS Code

```javascript
// Создание Output Channel
outputChannel = vscode.window.createOutputChannel('Docker Build');

// Слушатель терминала
vscode.window.onDidWriteTerminalData(e => {
    if (isDockerComposeCommand(e.data)) {
        startAnimation();
    }
});
```

---

## Лицензия

MIT License

---

**Седунов Андрей М3104**
