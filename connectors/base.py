from abc import ABC, abstractmethod

class DataConnector(ABC):
    @abstractmethod
    async def check_email(self, email: str) -> str:
        pass
