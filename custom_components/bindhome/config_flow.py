"""Config flow for BindHome."""

from __future__ import annotations

from typing import Any

from homeassistant import config_entries

from .const import DOMAIN, NAME


class BindHomeConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle the BindHome config flow."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Create the single BindHome config entry without an empty form."""
        del user_input

        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        return self.async_create_entry(title=NAME, data={})
