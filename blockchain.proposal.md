# Blockchain

Blockchain розподілена база даних, яка зберігає інформацію в вигляд ланцюга блоків. Кожний блок має набір даних та хеш
попереднього блоку.

## Проблематика

Блокчейн вирішує кілька важливих проблем, пов'язаних із безпекою, довірою, прозорістю та ефективністю обробки даних у
децентралізованих системах. Основні проблеми, які вирішує блокчейн, включають:

1. Проблема довіри (Trust Issue)
   У традиційних централізованих системах довіра покладається на центрального посередника, такого як банк, уряд або інша
   організація. Блокчейн усуває необхідність у посередниках, дозволяючи учасникам довіряти один одному за допомогою
   криптографічних методів і децентралізованої мережі.

2. Проблема безпеки (Security Issue)
   Блокчейн використовує криптографічні методи для забезпечення безпеки даних. Кожен блок містить хеш попереднього
   блоку, що робить майже неможливим змінити дані без зміни всіх наступних блоків. Це забезпечує високий рівень захисту
   від підробки та шахрайства.

3. Прозорість і відстежуваність (Transparency and Traceability)
   Блокчейн забезпечує прозорість транзакцій, оскільки всі учасники мережі можуть бачити всі транзакції. Це особливо
   корисно в ланцюгах постачання, де відстежуваність товарів від виробника до споживача є критично важливою.

4. Проблема подвійних витрат (Double-Spending Problem)
   У традиційних цифрових системах існує ризик подвійних витрат, коли одна й та ж цифрова валюта витрачається більше
   одного разу. Блокчейн вирішує цю проблему за допомогою механізмів консенсусу, таких як Proof of Work або Proof of
   Stake, які підтверджують транзакції і забезпечують, що кожна монета витрачається тільки один раз.

5. Децентралізація (Decentralization)
   Блокчейн дозволяє створювати децентралізовані додатки (DApps) без єдиного центру керування. Це знижує ризики,
   пов'язані з централізованим керуванням, такі як збій системи або зловживання владою.

6. Зниження витрат (Cost Reduction)
   Усунення посередників у багатьох транзакційних процесах значно знижує витрати на операції. Це особливо важливо у
   фінансових та міжнародних переказах, де комісії можуть бути дуже високими.

7. Проблема часу (Time Issue)
   Традиційні транзакції, особливо міжнародні, можуть займати кілька днів для обробки. Блокчейн-транзакції можуть бути
   завершені за кілька хвилин або навіть секунд, що значно підвищує ефективність.

Приклади застосування блокчейну
Фінанси: Криптовалюти, міжнародні грошові перекази, смарт-контракти для автоматизації фінансових угод.
Ланцюги постачання: Відстеження товарів від виробника до споживача для забезпечення прозорості та боротьби з підробками.
Голосування: Безпечні та прозорі системи електронного голосування.
Охорона здоров'я: Захищене зберігання та обмін медичними даними пацієнтів.
Нерухомість: Реєстрація прав власності та автоматизація угод з нерухомістю.

## Можливості

Ви можете передавати будь-які дані в транзакціях блокчейну, не обмежуючись лише фінансовими транзакціями. Це можуть бути
контракти, повідомлення, документи, сертифікати, файли та багато іншого. Наприклад, у транзакціях можна передавати
метадані, пов'язані з правами власності, інтелектуальною власністю, логістичними ланцюгами постачання тощо.

Давайте розглянемо приклад, де ми реалізуємо блокчейн для зберігання документів. У цьому прикладі кожна транзакція
містить документ, який може бути зашифрований для безпеки.

## Структура

Структура Blockchain складається з двох частин - заголовку та массиву транзакцій:

### Заголовок - інформація про блок.

#### Транзакції

Транзакції перелік всіх транзакцій, які включені в блок. Транзакції зберігаються в вигляді послідовності. Транзакції в
`Bitcoin` представляють собою перекази криптовалюти між адресами

#### Загальний вигляд

```typescript
type BlockChain = Block[]
type Block = {
    header: {
        version: string // Версія ПО, яка створила блок
        previousBlockHash: string // Хеш попереднього блоку.
        merkleRoot: string // Корень дерева Меркла побудованого з транзакцій в блоці.
        timestamp: Date // Час створення блоку в форматі Unix time.
        targetBits: Date // Цілове значення складності для наступного блоку.
        nonce: number // Числове значення, яке необхідно змінювати, щоб знайти правильний хеш блоку.
    }
    transactions: [
        {
            version: string // Версія транзакції
            inputs: [ // Список входів транзакції, кожен з яких вказує на попередню транзакцію і використовує її виходи.
                {
                    previousTransactionHash: string // Хеш попередньої транзакції.
                    outputIndex: number // Індекс використовуваного виходу в попередній транзакції.
                    scriptSig: string // Скрипт для розблокування виходів попередньої транзакції (цифровий підпис і публічний ключ).
                    sequence: number // Поле послідовності, що використовується для тимчасових блокувань.
                }
            ]
            outputs: [ // Список виходів транзакції, кожен з яких містить адресу одержувача та суму
                {
                    value: number // Сума в сатоші (1 сатоші = 0.00000001 BTC).
                    ScriptPubKey: string // Скрипт, що визначає умови, за яких вихід може бути витрачений (зазвичай це адреса одержувача).
                }
            ]
        }
    ]
}
```

Приклад:

```Typescript
const block: Block = {
    {
        header: {
            version": 2,
            previousBlockHash: "0000000000000000000769b0e7bcd7c3a5d5b5d5d5d5d5d5d5d5d5d5d5d5d5d5",
            merkleRoot: "4d8d9bbf0a2b1c56ffb9b3d1e6f8d8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8",
            timestamp: 1625097600,
            targetBits: 419520339,
            nonce: 2838320639
        }
        transcation: [
            {
              version: 2,
              inputs: [
                {
                  previousTransactionHash: "5a1b7b8c...",
                  outputIndex: 0,
                  scriptSig: "3045022100...",
                  sequence: 4294967295
                }
              ],
              outputs: [
                {
                  value: 5000000000,
                  scriptPubKey: "76a914..."
                }
              ],
              lockTime: 0
            }
        ]
    },
}
```

#### Дерево Меркла

Дерево Меркла — це структура даних, яка використовується в комп'ютерних науках і криптографії для ефективної та
безпечної перевірки цілісності великих обсягів даних. Вона широко використовується в блокчейн-технологіях для
забезпечення цілісності та незмінності даних.

*Як працює дерево Меркла*

- Листові вузли: Найнижчий рівень дерева складається з хешів окремих елементів даних (наприклад, транзакцій).
- Проміжні вузли: Хеші листових вузлів об'єднуються попарно для створення хешів проміжних вузлів. Цей процес
  повторюється, поки не буде створено один кореневий хеш (корінь Меркла).
- Корінь Меркла: Остаточний хеш, який представляє весь набір даних. Цей хеш забезпечує стислий спосіб перевірки
  цілісності всього набору даних.

```markdown
         h_root
        /      \
     h_AB       h_CD
     /  \       /  \

h_A h_B h_C h_D
```

*Використання дерева Меркла в блокчейні*

- Цілісність даних: Дерево Меркла забезпечує цілісність даних у блоці, оскільки будь-яка зміна в будь-якій транзакції
  змінить відповідний хеш і, відповідно, корінь Меркла.
- Ефективна перевірка: Використовуючи корінь Меркла, можна ефективно перевірити цілісність окремих транзакцій без
  необхідності перевіряти весь набір даних.
- Простота перевірки: Для перевірки окремої транзакції потрібно лише перевірити невелику частину дерева (вузли на шляху
  від листа до кореня), що робить процес перевірки швидким і ефективним.

```Typescript
import * as crypto from 'crypto';

class MerkleTree {
  private leaves: string[];
  private layers: string[][];

  constructor(leaves: string[]) {
    this.leaves = leaves.map(leaf => this.hash(leaf));
    this.layers = [this.leaves];
    this.buildTree();
  }

  private hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private buildTree() {
    let currentLayer = this.leaves;
    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(this.hash(currentLayer[i] + currentLayer[i + 1]));
        } else {
          nextLayer.push(currentLayer[i]);
        }
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  public getRoot(): string {
    return this.layers[this.layers.length - 1][0];
  }

  public getProof(index: number): { data: string, hash: string }[] {
    const proof: { data: string, hash: string }[] = [];
    let currentIndex = index;

    for (let i = 0; i < this.layers.length - 1; i++) {
      const currentLayer = this.layers[i];
      const isRightNode = currentIndex % 2 === 1;
      const pairIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

      if (pairIndex < currentLayer.length) {
        proof.push({
          data: currentLayer[pairIndex],
          hash: isRightNode ? 'right' : 'left'
        });
      }
      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  public verifyProof(proof: { data: string, hash: string }[], leaf: string, root: string): boolean {
    let hash = this.hash(leaf);

    for (const item of proof) {
      if (item.hash === 'left') {
        hash = this.hash(item.data + hash);
      } else {
        hash = this.hash(hash + item.data);
      }
    }

    return hash === root;
  }

  public getLayers(): string[][] {
    return this.layers;
  }
}

// Приклад використання
const leaves = ['A', 'B', 'C', 'D'];
const merkleTree = new MerkleTree(leaves);

console.log('Leaves:', leaves);
console.log('Layers:', merkleTree.getLayers());
console.log('Root:', merkleTree.getRoot());

const index = 2; // Індекс елемента, для якого ми хочемо отримати доказ
const proof = merkleTree.getProof(index);
console.log('Proof for index', index, ':', proof);

const leaf = leaves[index];
const isValid = merkleTree.verifyProof(proof, leaf, merkleTree.getRoot());
console.log('Is valid proof:', isValid);

```

## Запис блоків в Blockchain

Запис блоків у блокчейн залежить від конкретного типу блокчейну та алгоритму консенсусу, який він використовує. Різні
блокчейни можуть мати різні механізми для додавання нових блоків. Ці механізми забезпечують безпеку,
децентралізацію і цілісність даних у блокчейні.

Алгоритми консенсусу та хто може записувати блоки
**Proof of Work (PoW)**:

- Приклад: Bitcoin, Ethereum (до переходу на Proof of Stake).
- Хто може записувати блоки: Майнери. Будь-який учасник мережі, який вирішує криптографічну задачу (майнить), може
  створити новий блок. Майнери змагаються за право додавання блоку, і той, хто першим вирішує задачу, додає блок у
  блокчейн і отримує винагороду.
- Процес: Майнери використовують обчислювальну потужність для вирішення складних завдань. Перший, хто вирішує завдання,
  додає блок і розповсюджує його в мережу. Інші вузли перевіряють блок і додають його до своєї копії блокчейну.

**Proof of Stake (PoS)**:

- Приклад: Ethereum (після переходу на PoS), Cardano.
- Хто може записувати блоки: Валідатори. Вузли, які ставлять свої токени як заставу (ставки), можуть бути обрані для
  створення нового блоку. Чим більша ставка, тим вище ймовірність бути обраним.
- Процес: Валідатор, який створює блок, отримує винагороду. Якщо валідатор діє нечесно, він втрачає свою ставку. Це
  стимулює валідаторів діяти чесно.

**Delegated Proof of Stake (DPoS)**:

- Приклад: EOS, TRON.
- Хто може записувати блоки: Делегати. Користувачі мережі голосують за делегатів, які будуть створювати блоки. Тільки
  обрані делегати можуть додавати нові блоки.
- Процес: Делегати створюють блоки по черзі. Якщо делегат не справляється зі своїми обов'язками, користувачі можуть
  переобрати його.

**Proof of Authority (PoA)**:

- Приклад: VeChain, ряд корпоративних блокчейнів.
- Хто може записувати блоки: Уповноважені вузли. Це можуть бути заздалегідь визначені учасники або організації, які
  мають
  право додавати нові блоки.
- Процес: Уповноважені вузли додають блоки в блокчейн. Цей метод зазвичай використовується у приватних або корпоративних
  блокчейнах, де довіра до учасників висока.

**Byzantine Fault Tolerance (BFT)**:

- Приклад: Hyperledger Fabric, Tendermint.
- Хто може записувати блоки: Учасники консенсусу. Учасники мережі спільно домовляються про додавання нового блоку шляхом
  голосування і досягнення консенсусу.
- Процес: Учасники мережі обмінюються повідомленнями для досягнення згоди щодо нового блоку. Це дозволяє досягти
  консенсусу навіть за наявності недовірених вузлів.

### Ролі та механізми

- Майнери: Учасники в алгоритмах Proof of Work. Вони використовують обчислювальні потужності для вирішення задач і
  додавання блоків.
- Валідатори: Учасники в алгоритмах Proof of Stake. Вони ставлять свої токени на кон і отримують право додавати блоки.
  Делегати: Учасники в алгоритмах Delegated Proof of Stake. Вони обираються користувачами і отримують право додавати
  блоки.
- Уповноважені вузли: Учасники в алгоритмах Proof of Authority. Вони заздалегідь визначені і мають право додавати блоки.
- Учасники консенсусу: Учасники в алгоритмах Byzantine Fault Tolerance. Вони обмінюються повідомленнями і досягають
  консенсусу щодо нового блоку.

### Приклад на Ethereum (Proof of Stake)

В Ethereum після переходу на Proof of Stake валідатори записують блоки. Ось короткий огляд процесу:

**Вибір валідатора** : Валідатори обираються випадковим чином для створення нового блоку, виходячи з їх ставок.
Створення блоку: Обраний валідатор створює новий блок, включає транзакції і підписує його своїм приватним ключем.
Розповсюдження блоку: Валідатор розповсюджує блок по мережі. Інші вузли перевіряють блок і додають його до своєї копії
блокчейну.
**Винагорода**: Валідатор отримує винагороду за створення блоку.
У цьому процесі валідатори стимулюються діяти чесно, оскільки нечесна поведінка призводить до втрати їхньої ставки.

### Реалізація Blockchain

```Typescript
import * as crypto from 'crypto';

// Клас для представлення блоку
class Block {
    public index: number;
    public timestamp: number;
    public data: any;
    public previousHash: string;
    public hash: string;
    public nonce: number;
    public pendingTransactions: Transaction[];

    constructor(index: number, timestamp: number, data: any, previousHash: string = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = '';
        this.nonce = 0;
        this.pendingTransactions = [];
    }

    // Метод для обчислення хешу блоку
    calculateHash(): string {
        return crypto.createHash('sha256').update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).digest('hex');
    }

    // Метод для виконання майнінгу блоку
    mineBlock(difficulty: number): void {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }
}

// Клас для представлення блокчейну
class Blockchain {
    public chain: Block[];
    public difficulty: number;

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
    }

    // Метод для створення генезис-блоку
    createGenesisBlock(): Block {
        return new Block(0, Date.now(), "Genesis Block", "0");
    }

    // Метод для отримання останнього блоку в ланцюзі
    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    // Метод для додавання нового блоку в ланцюг
    addBlock(newBlock: Block): void {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }
    
    // Метод для майнінгу блоку з незавершеними транзакціями
    minePendingTransactions(miningRewardAddress: string): void {
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    // Метод для створення нової транзакції
    createTransaction(transaction: Transaction): void {
        this.pendingTransactions.push(transaction);
    }

    // Метод для перевірки балансу адреси
    getBalanceOfAddress(address: string): number {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    // Метод для перевірки цілісності блокчейну
    isChainValid(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Приклад використання
let myCoin = new Blockchain();
myCoin.createTransaction(new Transaction('address1', 'address2', 100));
myCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('Starting the miner...');
myCoin.minePendingTransactions('miner-address');

console.log('Balance of miner is', myCoin.getBalanceOfAddress('miner-address'));

console.log('Starting the miner again...');
myCoin.minePendingTransactions('miner-address');

console.log('Balance of miner is', myCoin.getBalanceOfAddress('miner-address'));

console.log(JSON.stringify(myCoin, null, 4));
```

### Механізм створення транзакцій

Транзакції додаються в окремий список незавершених транзакцій (pendingTransactions).
Коли майнер вирішує майнити новий блок, всі незавершені транзакції включаються в цей новий блок,
який потім додається до ланцюга блоків.

**Створення транзакції**

Користувач створює нову транзакцію і додає її до списку незавершених транзакцій за допомогою методу `createTransaction`.

**Майнінг нового блоку**

Майнер викликає метод `minePendingTransactions`, який створює новий блок з усіма незавершеними транзакціями.
Новий блок включає всі транзакції зі списку `pendingTransactions` і додається до ланцюга блоків після успішного
майнінгу.

**Очищення списку незавершених транзакцій**

Після додавання блоку до ланцюга список `pendingTransactions` очищується, і додається транзакція винагороди за майнінг.

**Додавання нових транзакцій**

У випадку, коли транзакція створюється після того, як майнер вже взяв блок для майнінгу, така транзакція залишиться в
списку незавершених транзакцій (pendingTransactions) і буде включена в наступний блок, коли майнер вирішить майнити
новий блок. Це забезпечує, що всі нові транзакції будуть оброблені в майбутніх блоках.

## Процес майнінгу та обробки транзакцій

**Створення транзакцій клієнтами**

- Клієнти надсилають запити на створення транзакцій до веб-сервера.
- Веб-сервер додає транзакції до списку незавершених транзакцій (pendingTransactions).
-

**Процес майнінгу**

- Майнери постійно запитують веб-сервер для отримання останнього блоку та списку незавершених транзакцій.
- Майнери виконують майнінг на своїх машинах, намагаючись знайти хеш, який відповідає вимогам складності.
- Коли майнер знаходить правильний хеш, він надсилає запит на веб-сервер для додавання нового блоку до блокчейну.

**Додавання блоку до блокчейну**

- Веб-сервер перевіряє, чи блок дійсно вирішує завдання майнінгу.
- Якщо блок дійсний, він додається до блокчейну, а список pendingTransactions очищується.

**Оповіщення учасників**

- Веб-сервер сповіщає всіх клієнтів про додавання нового блоку до блокчейну, і клієнти можуть оновити свої копії
  блокчейну.

### Приклад реалізації

Простий блокчейн

```Typescript
import * as crypto from 'crypto';

class Transaction {
    public fromAddress: string | null;
    public toAddress: string;
    public amount: number;

    constructor(fromAddress: string | null, toAddress: string, amount: number) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block {
    public timestamp: number;
    public transactions: Transaction[];
    public previousHash: string;
    public hash: string;
    public nonce: number;

    constructor(timestamp: number, transactions: Transaction[], previousHash: string = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = '';
        this.nonce = 0;
    }

    calculateHash(): string {
        return crypto.createHash('sha256').update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).digest('hex');
    }

    mineBlock(difficulty: number): void {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }
}

class Blockchain {
    public chain: Block[];
    public difficulty: number;
    public pendingTransactions: Transaction[];
    public miningReward: number;

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(): Block {
        return new Block(Date.now(), [], "0");
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress: string): void {
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    createTransaction(transaction: Transaction): void {
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address: string): number {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

export { Blockchain, Transaction, Block };
```

Простий сервер

```Typescript
import express from 'express';
import bodyParser from 'body-parser';
import { Blockchain, Transaction, Block } from './blockchain';

const app = express();
const port = 3000;

app.use(bodyParser.json());

let myCoin = new Blockchain();

app.get('/blockchain', (req, res) => {
    res.send(myCoin);
});

app.post('/transactions', (req, res) => {
    const { fromAddress, toAddress, amount } = req.body;
    const transaction = new Transaction(fromAddress, toAddress, amount);
    myCoin.createTransaction(transaction);
    res.send('Transaction added');
});

app.post('/mine', (req, res) => {
    const { address } = req.body;
    myCoin.minePendingTransactions(address);
    res.send('Mining complete');
});

app.get('/balance/:address', (req, res) => {
    const { address } = req.params;
    const balance = myCoin.getBalanceOfAddress(address);
    res.send(`Balance of ${address} is ${balance}`);
});

app.listen(port, () => {
    console.log(`Blockchain server listening on port ${port}`);
});
```

## Транзакції

Для того, щоб переконатися, що транзакції дійсно здійснюються власниками адрес і що вони мають достатньо коштів,
використовується криптографія з відкритим ключем (асиметричне шифрування). Основні принципи включають цифрові підписи і
перевірку балансу.

**Основні компоненти**
Цифрові підписи: Кожна транзакція підписується приватним ключем відправника. Інші учасники можуть використовувати
відкритий ключ для перевірки підпису і впевненості, що транзакція дійсно створена власником адреси.

Перевірка балансу: Перед додаванням транзакції до блоку, майнери перевіряють, чи має відправник достатньо коштів для
виконання транзакції.

**Реалізація цифрових підписів**
Для реалізації цього механізму потрібно:

- Створити пари ключів (приватний і відкритий)**
- Підписувати транзакції приватним ключем.
- Перевіряти підписи транзакцій відкритим ключем.

- Ось оновлений приклад з використанням бібліотеки crypto для реалізації цифрових підписів:

```Typescript
import * as crypto from 'crypto';

class Transaction {
    public fromAddress: string | null;
    public toAddress: string;
    public amount: number;
    public signature: string | null;

    constructor(fromAddress: string | null, toAddress: string, amount: number) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.signature = null;
    }

    calculateHash(): string {
        return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + this.amount).digest('hex');
    }

    signTransaction(signingKey: crypto.KeyObject): void {
        if (!this.fromAddress) {
            throw new Error('Cannot sign transactions for mining rewards');
        }

        const hashTx = this.calculateHash();
        const sign = crypto.createSign('SHA256');
        sign.update(hashTx).end();

        const signature = sign.sign(signingKey);
        this.signature = signature.toString('hex');
    }

    isValid(): boolean {
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = crypto.createPublicKey(this.fromAddress);
        const verify = crypto.createVerify('SHA256');
        verify.update(this.calculateHash()).end();

        return verify.verify(publicKey, Buffer.from(this.signature, 'hex'));
    }
}

class Block {
    public timestamp: number;
    public transactions: Transaction[];
    public previousHash: string;
    public hash: string;
    public nonce: number;

    constructor(timestamp: number, transactions: Transaction[], previousHash: string = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = '';
        this.nonce = 0;
    }

    calculateHash(): string {
        return crypto.createHash('sha256').update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).digest('hex');
    }

    mineBlock(difficulty: number): void {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }

    hasValidTransactions(): boolean {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
}

class Blockchain {
    public chain: Block[];
    public difficulty: number;
    public pendingTransactions: Transaction[];
    public miningReward: number;

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(): Block {
        return new Block(Date.now(), [], "0");
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress: string): void {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction: Transaction): void {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
            throw new Error('Insufficient balance');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address: string): number {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Приклад використання
const { generateKeyPairSync } = crypto;
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
});

const myKey = crypto.createPrivateKey({
    key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
    format: 'pem',
});
const myWalletAddress = publicKey.export({ type: 'spki', format: 'pem' }).toString('hex');

let myCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'address2', 100);
tx1.signTransaction(myKey);
myCoin.addTransaction(tx1);

console.log('Starting the miner...');
myCoin.minePendingTransactions(myWalletAddress);

console.log('Balance of miner is', myCoin.getBalanceOfAddress(myWalletAddress));

console.log('Is blockchain valid?', myCoin.isChainValid());
```

### Безпека смарт-контрактів

```Typescript
import * as crypto from 'crypto';

class Transaction {
    public fromAddress: string | null;
    public toAddress: string;
    public amount: number;
    public encryptedData: string | null;
    private symmetricKey: Buffer;

    constructor(fromAddress: string | null, toAddress: string, amount: number, symmetricKey: Buffer) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.encryptedData = null;
        this.symmetricKey = symmetricKey;
    }

    // Функція для шифрування конфіденційних даних
    encryptData(data: string): void {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.symmetricKey, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        this.encryptedData = iv.toString('hex') + ':' + encrypted;
    }

    // Функція для дешифрування конфіденційних даних
    decryptData(): string {
        if (!this.encryptedData) {
            throw new Error('No data to decrypt');
        }
        const textParts = this.encryptedData.split(':');
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = textParts.join(':');
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.symmetricKey, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

// Клас для представлення блоку
class Block {
    public timestamp: number;
    public transactions: Transaction[];
    public previousHash: string;
    public hash: string;
    public nonce: number;

    constructor(timestamp: number, transactions: Transaction[], previousHash: string = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = '';
        this.nonce = 0;
    }

    calculateHash(): string {
        return crypto.createHash('sha256').update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).digest('hex');
    }

    mineBlock(difficulty: number): void {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }

    hasValidTransactions(): boolean {
        for (const tx of this.transactions) {
            if (!tx) {
                return false;
            }
        }
        return true;
    }
}

// Клас для представлення блокчейну
class Blockchain {
    public chain: Block[];
    public difficulty: number;
    public pendingTransactions: Transaction[];
    public miningReward: number;

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(): Block {
        return new Block(Date.now(), [], "0");
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress: string, symmetricKey: Buffer): void {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward, symmetricKey);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction: Transaction): void {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
            throw new Error('Insufficient balance');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address: string): number {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Приклад використання
const symmetricKey = crypto.randomBytes(32); // 256 бітний ключ для AES-256
const myCoin = new Blockchain();

const tx1 = new Transaction('address1', 'address2', 100, symmetricKey);
tx1.encryptData('This is a secret message');
myCoin.addTransaction(tx1);

console.log('Starting the miner...');
myCoin.minePendingTransactions('miner-address', symmetricKey);

console.log('Balance of miner is', myCoin.getBalanceOfAddress('miner-address'));

console.log('Decrypting transaction data...');
console.log(tx1.decryptData());

console.log('Is blockchain valid?', myCoin

```

## Мотивація майнерів

Мотивація майнерів у блокчейн-мережах випливає з економічних винагород, які вони отримують за свою роботу. Ось основні
аспекти мотивації майнерів:

1. Блокова винагорода (Block Reward)
   Коли майнер знаходить новий блок, він отримує блокову винагороду. Це зазвичай певна кількість криптовалюти, яка
   визначається протоколом мережі. У випадку з Bitcoin, наприклад, майнери отримують певну кількість біткоїнів за кожен
   знайдений блок.

2. Комісії за транзакції (Transaction Fees)
   Крім блокової винагороди, майнери також отримують комісії за транзакції, включені в блок. Кожен користувач, який
   створює транзакцію, може додати комісію, щоб стимулювати майнерів включити його транзакцію в наступний блок.

3. Підтримка мережі (Network Support)
   Майнери грають ключову роль у підтримці безпеки і стабільності блокчейн-мережі. Вони перевіряють транзакції і додають
   їх у блокчейн, забезпечуючи, що лише легітимні транзакції включені у блоки.

4. Довгострокові інвестиції (Long-term Investment)
   Майнери, особливо ті, хто вірить у майбутнє конкретної криптовалюти, можуть вважати свою діяльність довгостроковою
   інвестицією. Вони накопичують криптовалюту, яку можна продати або використовувати в майбутньому.

## Зберігання Blockchain

Ооскільки обсяг даних може бути дуже великим через велику кількість транзакцій. Існує кілька підходів до зберігання
блокчейну, які можуть допомогти ефективно керувати обсягом даних і забезпечити надійний доступ до них.

### Приклад з MongoDB

```Typescript
import * as mongoose from 'mongoose';
import * as crypto from 'crypto';

// Підключення до MongoDB
mongoose.connect('mongodb://localhost:27017/blockchain', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Схеми для блоків і транзакцій
const transactionSchema = new mongoose.Schema({
    fromAddress: String,
    toAddress: String,
    amount: Number,
    encryptedData: String,
});

const blockSchema = new mongoose.Schema({
    timestamp: Number,
    transactions: [transactionSchema],
    previousHash: String,
    hash: String,
    nonce: Number,
});

const TransactionModel = mongoose.model('Transaction', transactionSchema);
const BlockModel = mongoose.model('Block', blockSchema);

class Transaction {
    public fromAddress: string | null;
    public toAddress: string;
    public amount: number;
    public encryptedData: string | null;
    private symmetricKey: Buffer;

    constructor(fromAddress: string | null, toAddress: string, amount: number, symmetricKey: Buffer) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.encryptedData = null;
        this.symmetricKey = symmetricKey;
    }

    encryptData(data: string): void {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.symmetricKey, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        this.encryptedData = iv.toString('hex') + ':' + encrypted;
    }

    decryptData(): string {
        if (!this.encryptedData) {
            throw new Error('No data to decrypt');
        }
        const textParts = this.encryptedData.split(':');
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = textParts.join(':');
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.symmetricKey, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

class Block {
    public timestamp: number;
    public transactions: Transaction[];
    public previousHash: string;
    public hash: string;
    public nonce: number;

    constructor(timestamp: number, transactions: Transaction[], previousHash: string = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = '';
        this.nonce = 0;
    }

    calculateHash(): string {
        return crypto.createHash('sha256').update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).digest('hex');
    }

    mineBlock(difficulty: number): void {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }

    async saveToDB(): Promise<void> {
        const blockDoc = new BlockModel(this);
        await blockDoc.save();
    }

    static async loadFromDB(hash: string): Promise<Block | null> {
        const blockDoc = await BlockModel.findOne({ hash }).exec();
        if (!blockDoc) return null;

        const transactions = blockDoc.transactions.map((tx: any) => new Transaction(tx.fromAddress, tx.toAddress, tx.amount, Buffer.from('')));
        const block = new Block(blockDoc.timestamp, transactions, blockDoc.previousHash);
        block.hash = blockDoc.hash;
        block.nonce = blockDoc.nonce;
        return block;
    }
}

class Blockchain {
    public chain: Block[];
    public difficulty: number;
    public pendingTransactions: Transaction[];
    public miningReward: number;

    constructor() {
        this.chain = [];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    async initialize(): Promise<void> {
        const genesisBlock = await Block.loadFromDB('0');
        if (genesisBlock) {
            this.chain.push(genesisBlock);
        } else {
            const genesisBlock = this.createGenesisBlock();
            await genesisBlock.saveToDB();
            this.chain.push(genesisBlock);
        }
    }

    createGenesisBlock(): Block {
        return new Block(Date.now(), [], "0");
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    async minePendingTransactions(miningRewardAddress: string, symmetricKey: Buffer): Promise<void> {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward, symmetricKey);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        await block.saveToDB();
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction: Transaction): void {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
            throw new Error('Insufficient balance');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address: string): number {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    async isChainValid(): Promise<boolean> {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Приклад використання
(async () => {
    const symmetricKey = crypto.randomBytes(32); // 256 бітний ключ для AES-256
    const myCoin
```

## Cassandra

```SQL
CREATE KEYSPACE blockchain WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

CREATE TABLE blockchain.transactions (
    id UUID PRIMARY KEY,
    fromAddress text,
    toAddress text,
    amount int,
    encryptedData text
);

CREATE TABLE blockchain.blocks (
    hash text PRIMARY KEY,
    timestamp bigint,
    previousHash text,
    nonce int,
    transactions list<UUID>
);

```

```Typescript
import * as cassandra from 'cassandra-driver';
import * as crypto from 'crypto';

// Налаштування Cassandra
const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'blockchain',
});

client.connect((err) => {
    if (err) console.error(err);
    else console.log('Connected to Cassandra');
});

class Transaction {
    public id: string;
    public fromAddress: string | null;
    public toAddress: string;
    public amount: number;
    public encryptedData: string | null;
    private symmetricKey: Buffer;

    constructor(fromAddress: string | null, toAddress: string, amount: number, symmetricKey: Buffer) {
        this.id = crypto.randomUUID();
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.encryptedData = null;
        this.symmetricKey = symmetricKey;
    }

    encryptData(data: string): void {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.symmetricKey, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        this.encryptedData = iv.toString('hex') + ':' + encrypted;
    }

    decryptData(): string {
        if (!this.encryptedData) {
            throw new Error('No data to decrypt');
        }
        const textParts = this.encryptedData.split(':');
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = textParts.join(':');
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.symmetricKey, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    async saveToDB(): Promise<void> {
        const query = 'INSERT INTO transactions (id, fromAddress, toAddress, amount, encryptedData) VALUES (?, ?, ?, ?, ?)';
        const params = [this.id, this.fromAddress, this.toAddress, this.amount, this.encryptedData];
        await client.execute(query, params, { prepare: true });
    }

    static async loadFromDB(id: string): Promise<Transaction | null> {
        const query = 'SELECT * FROM transactions WHERE id = ?';
        const result = await client.execute(query, [id], { prepare: true });
        if (result.rowLength === 0) return null;

        const row = result.first();
        const transaction = new Transaction(row.fromaddress, row.toaddress, row.amount, Buffer.from(''));
        transaction.id = row.id;
        transaction.encryptedData = row.encrypteddata;
        return transaction;
    }
}

class Block {
    public hash: string;
    public timestamp: number;
    public transactions: Transaction[];
    public previousHash: string;
    public nonce: number;

    constructor(timestamp: number, transactions: Transaction[], previousHash: string = '') {
        this.hash = '';
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
    }

    calculateHash(): string {
        return crypto.createHash('sha256').update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).digest('hex');
    }

    mineBlock(difficulty: number): void {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }

    async saveToDB(): Promise<void> {
        const transactionIds = this.transactions.map(tx => tx.id);
        const query = 'INSERT INTO blocks (hash, timestamp, previousHash, nonce, transactions) VALUES (?, ?, ?, ?, ?)';
        const params = [this.hash, this.timestamp, this.previousHash, this.nonce, transactionIds];
        await client.execute(query, params, { prepare: true });
    }

    static async loadFromDB(hash: string): Promise<Block | null> {
        const query = 'SELECT * FROM blocks WHERE hash = ?';
        const result = await client.execute(query, [hash], { prepare: true });
        if (result.rowLength === 0) return null;

        const row = result.first();
        const transactions = await Promise.all(row.transactions.map((id: string) => Transaction.loadFromDB(id)));
        const block = new Block(row.timestamp, transactions, row.previoushash);
        block.hash = row.hash;
        block.nonce = row.nonce;
        return block;
    }
}

class Blockchain {
    public chain: Block[];
    public difficulty: number;
    public pendingTransactions: Transaction[];
    public miningReward: number;

    constructor() {
        this.chain = [];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    async initialize(): Promise<void> {
        const genesisBlock = await Block.loadFromDB('0');
        if (genesisBlock) {
            this.chain.push(genesisBlock);
        } else {
            const genesisBlock = this.createGenesisBlock();
            await genesisBlock.saveToDB();
            this.chain.push(genesisBlock);
        }
    }

    createGenesisBlock(): Block {
        return new Block(Date.now(), [], "0");
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    async minePendingTransactions(miningRewardAddress: string, symmetricKey: Buffer): Promise<void> {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward, symmetricKey);
        await rewardTx.saveToDB();
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        block.hash = block.calculateHash();

        console.log('Block successfully mined!');
        await block.saveToDB();
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    async addTransaction(transaction: Transaction): Promise<void> {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (await this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
            throw new Error('Insufficient balance');
        }

        await transaction.saveToDB();
        this.pendingTransactions.push(transaction);
    }

    async getBalanceOfAddress(address: string): Promise<number> {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    async isChainValid(): Promise<boolean> {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Приклад використання
(async () => {
    const symmetricKey = crypto.randomBytes(32); // 256 бітний ключ для AES-256
    const myCoin = new Blockchain();
    await myCoin.initialize();

    const tx1 = new Transaction('address1', 'address2', 100, symmetricKey);
    tx1.encryptData('This is a secret message');
    await myCoin.addTransaction(tx1);

    console.log('Starting the miner...');
    await myCoin.minePendingTransactions('miner-address', symmetricKey);

    console.log('Balance of miner is', await myCoin

```

## Базова архітектура розподіленої системи

Для реалізації блокчейну як розподіленої системи з використанням мікросервісів і `Cassandra`, вам потрібно розділити
функціональність на кілька мікросервісів, кожен з яких буде відповідати за свою частину процесу. Основні компоненти
можуть включати:

- Мікросервіс для обробки транзакцій.
- Мікросервіс для майнінгу блоків.
- Мікросервіс для зберігання та отримання даних блокчейну.
- Мікросервіс для повідомлень про нові блоки.

**Архітектура системи**

- Transaction Service: Відповідає за прийом і зберігання транзакцій.
- Mining Service: Відповідає за майнінг блоків.
- Blockchain Storage Service: Відповідає за зберігання блоків і транзакцій у Cassandra.
- Notification Service: Відповідає за оповіщення про нові блоки (використовує WebSocket).

### Transaction Service

Без поділу на SOLID та абстракції

```Typescript
import * as express from 'express';
import * as cassandra from 'cassandra-driver';
import * as bodyParser from 'body-parser';
import * as crypto from 'crypto';

const app = express();
const port = 3001;

app.use(bodyParser.json());

// Налаштування Cassandra
const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'blockchain',
});

client.connect((err) => {
    if (err) console.error(err);
    else console.log('Connected to Cassandra');
});

class Transaction {
    public id: string;
    public fromAddress: string | null;
    public toAddress: string;
    public amount: number;
    public encryptedData: string | null;
    private symmetricKey: Buffer;

    constructor(fromAddress: string | null, toAddress: string, amount: number, symmetricKey: Buffer) {
        this.id = crypto.randomUUID();
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.encryptedData = null;
        this.symmetricKey = symmetricKey;
    }

    encryptData(data: string): void {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.symmetricKey, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        this.encryptedData = iv.toString('hex') + ':' + encrypted;
    }

    decryptData(): string {
        if (!this.encryptedData) {
            throw new Error('No data to decrypt');
        }
        const textParts = this.encryptedData.split(':');
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = textParts.join(':');
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.symmetricKey, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    async saveToDB(): Promise<void> {
        const query = 'INSERT INTO transactions (id, fromAddress, toAddress, amount, encryptedData) VALUES (?, ?, ?, ?, ?)';
        const params = [this.id, this.fromAddress, this.toAddress, this.amount, this.encryptedData];
        await client.execute(query, params, { prepare: true });
    }
}

app.post('/transaction', async (req, res) => {
    const { fromAddress, toAddress, amount, symmetricKey, data } = req.body;
    const transaction = new Transaction(fromAddress, toAddress, amount, Buffer.from(symmetricKey, 'hex'));
    transaction.encryptData(data);
    await transaction.saveToDB();
    res.send('Transaction added');
});

app.listen(port, () => {
    console.log(`Transaction Service listening on port ${port}`);
});
```

### Mining Service

Цей сервіс буде виконувати майнінг блоків і зберігати їх у Cassandra.

```Typescript
import * as express from 'express';
import * as cassandra from 'cassandra-driver';
import * as crypto from 'crypto';
import * as bodyParser from 'body-parser';

const app = express();
const port = 3002;

app.use(bodyParser.json());

// Налаштування Cassandra
const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'blockchain',
});

client.connect((err) => {
    if (err) console.error(err);
    else console.log('Connected to Cassandra');
});

class Transaction {
    public id: string;
    public fromAddress: string | null;
    public toAddress: string;
    public amount: number;
    public encryptedData: string | null;
    private symmetricKey: Buffer;

    constructor(fromAddress: string | null, toAddress: string, amount: number, symmetricKey: Buffer) {
        this.id = crypto.randomUUID();
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.encryptedData = null;
        this.symmetricKey = symmetricKey;
    }

    async saveToDB(): Promise<void> {
        const query = 'INSERT INTO transactions (id, fromAddress, toAddress, amount, encryptedData) VALUES (?, ?, ?, ?, ?)';
        const params = [this.id, this.fromAddress, this.toAddress, this.amount, this.encryptedData];
        await client.execute(query, params, { prepare: true });
    }

    static async loadFromDB(id: string): Promise<Transaction | null> {
        const query = 'SELECT * FROM transactions WHERE id = ?';
        const result = await client.execute(query, [id], { prepare: true });
        if (result.rowLength === 0) return null;

        const row = result.first();
        const transaction = new Transaction(row.fromaddress, row.toaddress, row.amount, Buffer.from(''));
        transaction.id = row.id;
        transaction.encryptedData = row.encrypteddata;
        return transaction;
    }
}

class Block {
    public hash: string;
    public timestamp: number;
    public transactions: Transaction[];
    public previousHash: string;
    public nonce: number;

    constructor(timestamp: number, transactions: Transaction[], previousHash: string = '') {
        this.hash = '';
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
    }

    calculateHash(): string {
        return crypto.createHash('sha256').update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).digest('hex');
    }

    mineBlock(difficulty: number): void {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }

    async saveToDB(): Promise<void> {
        const transactionIds = this.transactions.map(tx => tx.id);
        const query = 'INSERT INTO blocks (hash, timestamp, previousHash, nonce, transactions) VALUES (?, ?, ?, ?, ?)';
        const params = [this.hash, this.timestamp, this.previousHash, this.nonce, transactionIds];
        await client.execute(query, params, { prepare: true });
    }

    static async loadFromDB(hash: string): Promise<Block | null> {
        const query = 'SELECT * FROM blocks WHERE hash = ?';
        const result = await client.execute(query, [hash], { prepare: true });
        if (result.rowLength === 0) return null;

        const row = result.first();
        const transactions = await Promise.all(row.transactions.map((id: string) => Transaction.loadFromDB(id)));
        const block = new Block(row.timestamp, transactions, row.previoushash);
        block.hash = row.hash;
        block.nonce = row.nonce;
        return block;
    }
}

class Blockchain {
    public chain: Block[];
    public difficulty: number;
    public pendingTransactions: Transaction[];
    public miningReward: number;

    constructor() {
        this.chain = [];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    async initialize(): Promise<void> {
        const genesisBlock = await Block.loadFromDB('0');
        if (genesisBlock) {
            this.chain.push(genesisBlock);
        } else {
            const genesisBlock = this.createGenesisBlock();
            await genesisBlock.saveToDB();
            this.chain.push(genesisBlock);
        }
    }

    createGenesisBlock(): Block {
        return new Block(Date.now(), [], "0");
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    async minePendingTransactions(miningRewardAddress: string, symmetricKey: Buffer): Promise<void> {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward, symmetricKey);
        await rewardTx.saveToDB();
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        block.hash = block.calculateHash();

        console.log('Block successfully mined!');
        await block.saveToDB();
        this.chain.push(block);

        this.pendingTransactions = [];

        // Повідомляємо про новий блок (може бути реалізовано через REST API або повідомлення в черзі)
    }

    async addTransaction(transaction: Transaction): Promise<void> {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (await this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
            throw new Error('Insufficient balance');
        }

        await transaction.saveToDB();
        this.pendingTransactions.push(transaction);
    }

    async getBalanceOfAddress(address: string): Promise<number> {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    async isChainValid(): Promise<boolean> {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

app.post('/mine', async (req, res) => {
    const { miningRewardAddress, symmetricKey } = req.body;
    const blockchain = new Blockchain();
    await blockchain.initialize();
    await blockchain.minePendingTransactions(miningRewardAddress, Buffer.from(symmetricKey, 'hex'));
    res.send('Block mined');
});

app.listen(port, () => {
    console.log(`Mining Service listening on port ${port}`);
});

```

### Notification Service

Цей сервіс буде повідомляти клієнтів про нові блоки через WebSocket.

```Typescript
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

export function notifyClients(block: any) {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(block));
        }
    });
}

```

### Blockchain Storage Service

Цей сервіс буде зберігати і надавати блоки та транзакції з Cassandra.

```Typescript
import * as express from 'express';
import * as cassandra from 'cassandra-driver';
import * as bodyParser from 'body-parser';

const app = express();
const port = 3003;

app.use(bodyParser.json());

// Налаштування Cassandra
const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'blockchain',
});

client.connect((err) => {
    if (err) console.error(err);
    else console.log('Connected to Cassandra');
});

app.get('/block/:hash', async (req, res) => {
    const { hash } = req.params;
    const query = 'SELECT * FROM blocks WHERE hash = ?';
    const result = await client.execute(query, [hash], { prepare: true });
    if (result.rowLength === 0) {
        res.status(404).send('Block not found');
        return;
    }
    res.send(result.first());
});

app.get('/transaction/:id', async (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM transactions WHERE id = ?';
    const result = await client.execute(query, [id], { prepare: true });
    if (result.rowLength === 0) {
        res.status(404).send('Transaction not found');
        return;
    }
    res.send(result.first());
});

app.listen(port, () => {
    console.log(`Blockchain Storage Service listening on port ${port}`);
});

```

## Комунікація між сервісами

Для забезпечення гарантованої доставки повідомлень між мікросервісами, Apache Kafka може бути кращим вибором порівняно з
RabbitMQ, особливо в контексті блокчейну та інших розподілених систем. Kafka забезпечує надійну обробку повідомлень і
високу масштабованість, що робить її відмінним рішенням для забезпечення гарантованої доставки.

**Чому Kafka?**

- Гарантована доставка: Kafka гарантує доставку повідомлень за допомогою механізмів підтвердження (acknowledgments) і
  повторної доставки.
- Висока пропускна здатність: Kafka підтримує високу пропускну здатність, що дозволяє обробляти мільйони повідомлень на
  секунду.
- Довготривале зберігання: Kafka зберігає повідомлення на диску протягом конфігурованого періоду часу, дозволяючи
  повторне відтворення повідомлень.
- Масштабованість: Kafka легко масштабується як вертикально (додаванням потужності окремим вузлам), так і
  горизонтально (додаванням нових вузлів до кластера).
- Висока доступність: Завдяки розподіленій архітектурі, Kafka забезпечує високу доступність і стійкість до відмов.

### Базовий приклад реалізації зʼєднання з Apache Kafka

```Typescript
import { Kafka, logLevel } from 'kafkajs';
import * as fs from 'fs';

const kafka = new Kafka({
    clientId: 'advanced-client',
    brokers: ['broker1:9093', 'broker2:9093'],
    connectionTimeout: 3000,
    requestTimeout: 25000,
    logLevel: logLevel.INFO,
    ssl: {
        rejectUnauthorized: false, // Якщо використовується самопідписаний сертифікат
        ca: [fs.readFileSync('/path/to/ca-cert')],
        key: fs.readFileSync('/path/to/client-key'),
        cert: fs.readFileSync('/path/to/client-cert'),
    },
    sasl: {
        mechanism: 'scram-sha-256', // або 'plain', 'scram-sha-512'
        username: 'your-username',
        password: 'your-password'
    }
});

const producer = kafka.producer({
    allowAutoTopicCreation: true,
    idempotent: true,
    transactionTimeout: 30000
});

const consumer = kafka.consumer({
    groupId: 'advanced-group',
    retry: {
        initialRetryTime: 300,
        retries: 8
    }
});

const run = async () => {
    await producer.connect();
    await consumer.connect();

    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                partition,
                offset: message.offset,
                value: message.value.toString()
            });
        },
    });

    setInterval(async () => {
        try {
            const result = await producer.send({
                topic: 'test-topic',
                messages: [
                    { value: 'Hello KafkaJS user!' }
                ]
            });
            console.log('Sent message:', result);
        } catch (error) {
            console.error('Error in sending message', error);
        }
    }, 5000);
};

const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    await consumer.disconnect();
    await producer.disconnect();
    process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

run().catch(console.error);
```

де:

- Kafka Config:
    - clientId: Унікальний ідентифікатор клієнта.
    - brokers: Список брокерів Kafka з портами, налаштованими для SSL-з'єднання.
    - connectionTimeout: Час очікування з'єднання.
    - requestTimeout: Час очікування відповіді на запит.
    - logLevel: Рівень журналу для KafkaJS.
    - ssl: Налаштування для SSL-з'єднання.
    - sasl: Налаштування для аутентифікації SASL.
- Producer Config:
    - allowAutoTopicCreation: Дозвіл на автоматичне створення тем.
    - idempotent: Забезпечує ідемпотентність продюсера.
    - transactionTimeout: Час очікування транзакції.

- Consumer Config:
    - groupId: Ідентифікатор групи споживачів.
    - retry: Налаштування для повторних спроб у разі невдачі.

- SSL Certificates:
    - ca: Сертифікат центру сертифікації (CA).
    - key: Приватний ключ клієнта.
    - cert: Сертифікат клієнта.

## Механізми комунікації

Kafka забезпечує декілька ключових функцій для комунікації, які допомагають організувати ефективний і надійний обмін
повідомленнями між мікросервісами. Основні функції включають:

- Продюсер (Producer): Відповідає за відправку (публікацію) повідомлень у Kafka.
- Споживач (Consumer): Відповідає за отримання (споживання) повідомлень з Kafka.
- Теми (Topics): Канали, через які продюсери і споживачі взаємодіють.
- Групи споживачів (Consumer Groups): Дозволяють розподіляти обробку повідомлень між кількома споживачами.
- Партиції (Partitions): Дозволяють масштабувати теми, забезпечуючи паралельну обробку повідомлень.
- Комміти офсетів (Offset Commits): Зберігання положення споживача для забезпечення надійного отримання повідомлень.

- Основні функції комунікації

1. Продюсер (Producer)
   Продюсер відповідає за відправку повідомлень у Kafka. Ви можете створити продюсера і відправляти повідомлення за
   допомогою методу send.

```Typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'my-producer',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    await producer.send({
        topic: 'my-topic',
        messages: [
            { value: 'Hello Kafka' },
        ],
    });
    await producer.disconnect();
};

run().catch(console.error);
```

2. Споживач (Consumer)
   Споживач відповідає за отримання повідомлень з Kafka. Ви можете створити споживача, підписатися на тему і обробляти
   повідомлення за допомогою методу run.

Приклад використання споживача:

```Typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'my-consumer',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'my-group' });

const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'my-topic', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                partition,
                offset: message.offset,
                value: message.value.toString(),
            });
        },
    });
};

run().catch(console.error);
```

3. Теми (Topics)
   Теми є основними каналами для обміну повідомленнями між продюсерами і споживачами. Продюсери відправляють
   повідомлення в теми, а споживачі підписуються на теми, щоб отримувати повідомлення.

4. Групи споживачів (Consumer Groups)
   Групи споживачів дозволяють розподіляти обробку повідомлень між кількома споживачами. Кожен споживач в групі отримує
   унікальний набір партицій для обробки.

5. Партиції (Partitions)
   Партиції дозволяють масштабувати теми, розподіляючи повідомлення між кількома партиціями. Кожна партиція обробляється
   незалежно, що забезпечує паралельну обробку повідомлень.

6. Комміти офсетів (Offset Commits)
   Комміти офсетів дозволяють споживачам зберігати своє положення в темі, щоб забезпечити надійне отримання повідомлень
   і уникнути їх втрати.

### ПРосунутий продюсер

```Typescript
import { Kafka, logLevel } from 'kafkajs';
import * as fs from 'fs';

const kafka = new Kafka({
    clientId: 'advanced-producer',
    brokers: ['broker1:9093', 'broker2:9093'],
    connectionTimeout: 3000,
    requestTimeout: 25000,
    logLevel: logLevel.INFO,
    ssl: {
        rejectUnauthorized: false, // Якщо використовується самопідписаний сертифікат
        ca: [fs.readFileSync('/path/to/ca-cert')],
        key: fs.readFileSync('/path/to/client-key')],
        cert: fs.readFileSync('/path/to/client-cert')],
    },
    sasl: {
        mechanism: 'scram-sha-256', // або 'plain', 'scram-sha-512'
        username: 'your-username',
        password: 'your-password'
    }
});

const producer = kafka.producer({
    allowAutoTopicCreation: true,
    idempotent: true, // Вмикає ідемпотентність
    transactionalId: 'my-transactional-id', // Ідентифікатор для транзакцій
    transactionTimeout: 60000 // Таймаут для транзакцій
});

const runProducer = async () => {
    await producer.connect();
    
    // Початок транзакції
    const transaction = await producer.transaction();

    try {
        // Відправка повідомлень у рамках транзакції
        await transaction.send({
            topic: 'my-topic',
            messages: [
                { value: 'Transactional message 1' },
                { value: 'Transactional message 2' }
            ],
        });

        // Завершення транзакції
        await transaction.commit();
        console.log('Transaction committed');
    } catch (error) {
        // Відкат транзакції у разі помилки
        await transaction.abort();
        console.error('Transaction aborted due to error', error);
    }

    await producer.disconnect();
};

runProducer().catch(console.error);

```

**Пояснення просунутого продюсера**

- Idempotent: Вмикає ідемпотентність, що забезпечує унікальність кожного повідомлення та запобігає дублюванню.
- TransactionalId: Вказує ідентифікатор транзакції для продюсера, що дозволяє групувати кілька операцій у межах однієї
  транзакції.
- TransactionTimeout: Встановлює таймаут для транзакцій.

### Просунутий споживач

Ось приклад просунутого споживача з налаштуванням ретраїв, балансування навантаження і комітів офсетів:

```Typescript
import { Kafka, logLevel } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'advanced-consumer',
    brokers: ['broker1:9093', 'broker2:9093'],
    connectionTimeout: 3000,
    requestTimeout: 25000,
    logLevel: logLevel.INFO,
    ssl: {
        rejectUnauthorized: false, // Якщо використовується самопідписаний сертифікат
        ca: [fs.readFileSync('/path/to/ca-cert')],
        key: fs.readFileSync('/path/to/client-key')],
        cert: fs.readFileSync('/path/to/client-cert')],
    },
    sasl: {
        mechanism: 'scram-sha-256', // або 'plain', 'scram-sha-512'
        username: 'your-username',
        password: 'your-password'
    }
});

const consumer = kafka.consumer({
    groupId: 'advanced-group',
    sessionTimeout: 30000, // Таймаут сесії
    heartbeatInterval: 3000, // Інтервал між heartbeat
    rebalanceTimeout: 60000, // Таймаут ребалансування
    retry: {
        initialRetryTime: 300,
        retries: 8
    }
});

const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'my-topic', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                partition,
                offset: message.offset,
                value: message.value.toString(),
            });

            // Коміт офсетів вручну
            await consumer.commitOffsets([
                { topic, partition, offset: (parseInt(message.offset) + 1).toString() }
            ]);
        },
    });
};

runConsumer().catch(console.error);

const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    await consumer.disconnect();
    process.exit(0);
};

// Обробка сигналів для коректного завершення
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

```

**Пояснення просунутого споживача**

- SessionTimeout: Встановлює таймаут сесії для споживача, після якого споживач вважається недоступним.
- HeartbeatInterval: Інтервал між heartbeat повідомленнями для підтримки з'єднання зі споживачем.
- RebalanceTimeout: Таймаут для процесу ребалансування, коли група споживачів перерозподіляє партиції.
- Retry: Налаштування ретраїв для обробки повідомлень у разі помилок.
- Manual Offset Commits: Коміти офсетів вручну для забезпечення контролю над обробкою повідомлень.

## Архітектура з Apache Kafka

**Сервіс сповіщення (Notification Service)**

- Приймає повідомлення від Kafka про нові блоки.
- Сповіщає клієнтів через WebSocket або інший протокол реального часу.

**Сервіс транзакцій (Transaction Service)**

- Приймає нові транзакції від клієнтів.
- Зберігає транзакції в Cassandra.
- Публікує нові транзакції в Kafka.

**Сервіс майнінгу (Mining Service)**

- Споживає транзакції з Kafka.
- Виконує майнінг нових блоків.
- Зберігає нові блоки в Cassandra.
- Публікує повідомлення про нові блоки в Kafka.

**Сервіс отримання даних блокчейну (Blockchain Data Service)**

- Надає API для отримання блоків та транзакцій з Cassandra.

### Взаємодія між сервісами

Kafka:

Слугує посередником для передачі транзакцій від сервісу транзакцій до сервісу майнінгу.
Передає повідомлення про нові блоки від сервісу майнінгу до сервісу сповіщення.
Cassandra:

Розподілена база даних для зберігання блоків та транзакцій.
Використовується всіма сервісами для читання та запису даних.

**Схема взаємоді**

1. Клієнт → Сервіс транзакцій:

- Клієнт відправляє нову транзакцію до сервісу транзакцій.
- Сервіс транзакцій зберігає транзакцію в Cassandra і публікує її в Kafka.

2. Kafka → Сервіс майнінгу:

- Сервіс майнінгу споживає транзакції з Kafka.
- Виконує майнінг нового блоку з транзакціями.
- Зберігає новий блок у Cassandra.
- Публікує повідомлення про новий блок у Kafka.

3. Kafka → Сервіс сповіщення:

4. Сервіс сповіщення споживає повідомлення про новий блок з Kafka.

- Сповіщає клієнтів через WebSocket або інший протокол реального часу.

5. Клієнт → Сервіс отримання даних блокчейну:

- Клієнт відправляє запити на отримання даних про блоки або транзакції.
- Сервіс отримання даних блокчейну читає дані з Cassandra і повертає їх клієнту.

## Впровадження криптовалюти

Впровадження криптовалюти у вашій архітектурі, яка включає мікросервіси, Cassandra та Kafka, вимагає додаткових кроків
для забезпечення емісії, обробки транзакцій і управління балансами користувачів. Ось покрокова інструкція з реалізації
цього завдання:

1. Емісія криптовалюти
   Створіть механізм для випуску (емісії) нових одиниць криптовалюти. Це може бути зроблено під час майнінгу нових
   блоків.

2. Управління балансами
   Вам потрібно відстежувати баланси користувачів, зберігаючи інформацію про їхні адреси та кількість монет на цих
   адресах.

3. Обробка транзакцій
   Транзакції повинні перевірятись на наявність достатнього балансу на рахунках відправників і відповідати правилам
   мережі.

4. Майнінг
   Процес майнінгу буде додавати нові блоки до блокчейну, включаючи транзакції і нові одиниці криптовалюти як винагороду
   за майнінг.

5. Валідація
   Перевірка валідності транзакцій та блоків є ключовою для забезпечення безпеки мережі.

## Обмінник криптовалюти

**Інтеграція з існуючими біржами**

- Інтегрувація з існуючими криптобіржами, які підтримують обмін вашої криптовалюти на фіатні гроші.
- Біржі надають API, через які можна здійснювати операції купівлі-продажу криптовалюти.

**Власний обмінник**
- Ви можете створити власний обмінник, де користувачі зможуть обмінювати фіатні гроші на вашу криптовалюту і навпаки.
- Обмінник повинен відповідати вимогам законодавства щодо фінансових операцій і AML/KYC процедур.

**Інтеграція з платіжними системами**

- Інтегрувати вашу платформу з платіжними системами (наприклад, PayPal, Stripe, банківські перекази), щоб
  приймати фіатні гроші і конвертувати їх у вашу криптовалюту.

**Маркетплейс**

- Створити маркетплейс, де користувачі можуть купувати товари і послуги за вашу криптовалюту. Це збільшить попит
  на вашу криптовалюту і створить реальну економічну активність.

### Покрокова реалізація обмінника

**Створення інтерфейсу для обміну**
- Реалізуйте API для обміну фіатних грошей на вашу криптовалюту і навпаки.
- Додайте інтерфейс для користувачів, де вони можуть здійснювати обмінні операції.

**Інтеграція з платіжними системами**
- Інтегруйте ваш сервіс з платіжними системами для прийому і виплати фіатних грошей.
- Переконайтеся, що ви дотримуєтесь всіх правових вимог (AML/KYC).

**Інтеграція з біржами**
- Використовуйте API існуючих бірж для обміну вашої криптовалюти на інші криптовалюти або фіатні гроші.
- Це дозволить вашим користувачам мати більший вибір і ліквідність.

**Безпека**
- Забезпечте високий рівень безпеки для зберігання коштів і проведення транзакцій.
- Використовуйте двофакторну автентифікацію (2FA), шифрування і інші методи захисту.