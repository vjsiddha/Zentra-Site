class DomainError(Exception):
    pass

class InsufficientCash(DomainError):
    pass

class InsufficientQuantity(DomainError):
    pass

class MarketDataError(DomainError):
    pass

class PersistenceError(DomainError):
    pass