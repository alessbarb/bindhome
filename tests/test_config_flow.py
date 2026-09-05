"""Tests for BindHome config flow."""

from homeassistant import config_entries, data_entry_flow
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.bindhome.const import DOMAIN, NAME


async def test_config_flow_single_instance(hass: HomeAssistant) -> None:
    """Create BindHome immediately and abort a second instance."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] == data_entry_flow.FlowResultType.CREATE_ENTRY
    assert result["title"] == NAME
    assert result["data"] == {}

    # Second attempt should abort immediately.
    result2 = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result2["type"] == data_entry_flow.FlowResultType.ABORT
    assert result2["reason"] == "single_instance_allowed"


async def test_config_flow_aborts_if_already_configured(
    hass: HomeAssistant,
) -> None:
    """Test flow aborts if a config entry already exists."""
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] == data_entry_flow.FlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"
