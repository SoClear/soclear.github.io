# get和set

```typescript
class Animal {
    private readonly _name: string
    private _age: number

    constructor(name: string, age: number) {
        this._name = name
        this._age = age
    }

    get name(): string {
        return this._name
    }

    get age(): number {
        return this._age
    }

    set age(value: number) {
        if (value >= 0) {
            this._age = value
        }
    }
}

const animal = new Animal('w', 2)

console.log(animal.name)
```
