in the server directory, i have tried to setup a project and i am trying to follow domain driven design and layered architecure, now in files like server/src/domain/user/user.entity.ts, i am trying to write an entity but it should follow some proper structure 


take some inspiration from here
```
1. Base Entity (base.entity.ts)

Provides foundational entity functionality with Effect support:

    BaseEntity class: Abstract base with id, createdAt, updatedAt
    IEntity interface: Core entity contract
    SerializedEntity: Type for persistence layer
    _fromSerialized(): Safe entity reconstruction from data
    _serialize(): Convert entity to plain object

2. Refined Types (refined.types.ts)

Branded types with Effect Schema integration:

    UUID: Branded UUID type with validation
    DateTime: Branded DateTime with coercion
    Email: Validated email addresses
    StringToUUID: Effect Schema transformer for UUID
    DateTimeFromAny: Union transformer for multiple date formats
    Optional(): Helper for optional fields with null handling

3. Validation Utils (validation.utils.ts)

Reusable validation building blocks:

    createNotEmptyFilter(): Factory for non-empty string validation
    Optional(): Wrapper for nullable schema fields

4. Base Repository (base.repository.ts)

Abstract repository pattern with Effect:

    BaseRepository<T>: Generic repository base class
    Common CRUD operations: insert, update, fetchById, etc
```

you would use Option and Result from our @carbonteq/fp library which is an internal library,

first see how i have implement existing domain files and then improve on it

for example, domain entity and repo should purely accepts and return entity or value object not custom types
each repo should only deal with one entity, unless it is an aggregate repo where we have more flexibility.

all of the entities should inherit form base entities.

use factory create method for entities

all validation should happen inside the `create` method using a class called UserGuards, or DocumentGuards etc, so validation logic should live there

the nullable properties should be explicitly typed

see this reference example
```
mport { BaseEntity, IEntity } from "@domain/utils/base.entity";
import { UUID } from "@domain/utils/refined.types";
import { Address } from "./address.vo";
import { SocialLinks } from "./socialLinks.vo";
import { Option as O } from "effect";

// Collapsed Maybe type definition
type Maybe<T> = T | O.Option<T> | null | undefined;

// Collapsed normalizeMaybe utility
const normalizeMaybe = <T>(value: Maybe<T>): O.Option<T> => {
  if (value === null || value === undefined) {
    return O.none();
  }
  if (O.isOption(value)) {
    return value;
  }
  return O.some(value);
};

// Collapsed optionToMaybe utility
const optionToMaybe = <T>(option: O.Option<T>): Maybe<T> => {
  return O.getOrNull(option) as Maybe<T>;
};

// Collapsed IHost interface
interface IHost extends IEntity {
  readonly userId: UUID;
  readonly dob: O.Option<Date>;
  readonly phoneNumber: O.Option<number>;
  readonly profileImage: O.Option<string>;
}

// Collapsed SerializedHost type
type SerializedHost = {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  dob: Maybe<Date>;
  phoneNumber: Maybe<number>;
  profileImage: Maybe<string>;
  address: unknown;
  socialLinks: unknown;
}

export class Host extends BaseEntity implements IHost {

  // Collapsed class properties
  userId: UUID;
  dob: O.Option<Date>;
  phoneNumber: O.Option<number>;
  profileImage: O.Option<string>;
  address: Address;
  socialLinks: SocialLinks;
  
  private constructor(data: SerializedHost, address: Address, socialLinks: SocialLinks) {

    // Collapsed constructor implementation with validation
    super();
    this._fromSerialized({
      id: data.id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
    
    const normalizedDob = normalizeMaybe(data.dob);
    const normalizedPhone = normalizeMaybe(data.phoneNumber);
    
    if (!Host.validateDateOfBirth(normalizedDob)) {
      throw new Error('Invalid date of birth');
    }
    if (!Host.validatePhoneNumber(normalizedPhone)) {
      throw new Error('Invalid phone number');
    }
    
    this.userId = data.userId as UUID;
    this.dob = normalizedDob;
    this.phoneNumber = normalizedPhone;
    this.profileImage = normalizeMaybe(data.profileImage);
    this.address = address;
    this.socialLinks = socialLinks;
  } 
  
  static create(serialized: SerializedHost): Host {

Controlled entity creation through factory method
    // Create value objects first
    const address = Address.create(serialized.address);
    const socialLinks = SocialLinks.create(serialized.socialLinks);
    
    // Validate and create host
    return new Host(serialized, address, socialLinks); 
  }

  // Collapsed validation guards
  private static validatePhoneNumber(phone: O.Option<number>): boolean {
    return O.match(phone, {
      onNone: () => true,
      onSome: (num) => num > 1000000000 && num < 9999999999
    });
  }
  
  private static validateDateOfBirth(dob: O.Option<Date>): boolean {
    return O.match(dob, {
      onNone: () => true,
      onSome: (date) => date < new Date() && date > new Date('1900-01-01')
    });
  }

  // Collapsed serialize method
  serialize(): SerializedHost {
    return {
      ...this._serialize(),
      userId: this.userId,
      dob: optionToMaybe(this.dob),
      phoneNumber: optionToMaybe(this.phoneNumber),
      profileImage: optionToMaybe(this.profileImage),
      address: this.address.serialize(),
      socialLinks: this.socialLinks.serialize()
    };
  }

  // Collapsed computed property
  get hasCompleteProfile(): boolean {
    return O.isSome(this.dob) && 
           O.isSome(this.phoneNumber) && 
           O.isSome(this.profileImage);
  }
}
```

also when you make these changes to domain, some things in server/src/app would break, and you need to fix it as well especially the types and some other implementation,

when you feel like you are done, do link by running commands in the `server` directory

like

`pnpm tsx --noEmit` and `pnpm biome lint .`