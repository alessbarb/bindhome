export function importBindingKey(binding) {
  const target = binding.entity_registry_id
    ? `registry:${binding.entity_registry_id}`
    : `entity:${binding.entity_id}`;
  return `${binding.capability}:${binding.role ?? "primary"}:${target}`;
}

export function createImportReviewState(discovery) {
  return {
    revision: discovery.revision,
    scope: discovery.scope,
    reviews: (discovery.proposals ?? []).map((proposal) => ({
      proposal,
      action: null,
      asset: {
        name: proposal.asset.name,
        asset_type: proposal.asset.asset_type,
        area_id: proposal.asset.area_id ?? "",
        capabilities: [...(proposal.asset.capabilities ?? [])],
      },
      targetAssetId: "",
      selectedBindings: new Set(
        (proposal.bindings ?? []).map((binding) => importBindingKey(binding)),
      ),
    })),
  };
}

export function updateImportReview(state, proposalId, updater) {
  return {
    ...state,
    reviews: state.reviews.map((review) =>
      review.proposal.proposal_id === proposalId ? updater(review) : review,
    ),
  };
}

export function setImportAction(state, proposalId, action) {
  return updateImportReview(state, proposalId, (review) => ({
    ...review,
    action,
    targetAssetId: action === "merge" ? review.targetAssetId : "",
  }));
}

export function updateImportAsset(state, proposalId, changes) {
  return updateImportReview(state, proposalId, (review) => ({
    ...review,
    asset: { ...review.asset, ...changes },
  }));
}

export function setImportMergeTarget(state, proposalId, targetAssetId) {
  return updateImportReview(state, proposalId, (review) => ({
    ...review,
    targetAssetId,
  }));
}

export function toggleImportBinding(state, proposalId, binding) {
  return updateImportReview(state, proposalId, (review) => {
    const selectedBindings = new Set(review.selectedBindings);
    const key = importBindingKey(binding);
    if (selectedBindings.has(key)) selectedBindings.delete(key);
    else selectedBindings.add(key);
    return { ...review, selectedBindings };
  });
}

export function setImportCapabilities(state, proposalId, value) {
  const capabilities = [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
  return updateImportAsset(state, proposalId, { capabilities });
}

export function importReviewReady(review) {
  if (!review.action) return false;
  if (review.action === "skip") return true;
  if (review.action === "merge") return Boolean(review.targetAssetId);
  return Boolean(review.asset.name.trim() && review.asset.asset_type.trim());
}

export function importBatchReady(state) {
  return Boolean(state?.reviews?.length) && state.reviews.every(importReviewReady);
}

function selectedBindingPayload(review) {
  return (review.proposal.bindings ?? [])
    .filter((binding) => review.selectedBindings.has(importBindingKey(binding)))
    .map((binding) => ({
      capability: binding.capability,
      role: binding.role ?? "primary",
      entity_id: binding.entity_id,
      ...(binding.entity_registry_id
        ? { entity_registry_id: binding.entity_registry_id }
        : {}),
    }));
}

export function serializeImportDecisions(state) {
  return state.reviews.map((review) => {
    const base = {
      proposal_id: review.proposal.proposal_id,
      action: review.action,
    };
    if (review.action === "skip") return base;

    const bindings = selectedBindingPayload(review);
    if (review.action === "merge") {
      return {
        ...base,
        target_asset_id: review.targetAssetId,
        bindings,
      };
    }

    return {
      ...base,
      asset: {
        name: review.asset.name.trim(),
        asset_type: review.asset.asset_type.trim(),
        capabilities: [...review.asset.capabilities],
        ...(review.asset.area_id ? { area_id: review.asset.area_id } : {}),
      },
      bindings,
    };
  });
}

export function importStatusKey(status) {
  return `import.status.${status ?? "new"}`;
}

export function prioritizedMergeAssets(assets, proposal) {
  const preferred = new Set(proposal.merge_candidate_asset_ids ?? []);
  return [...assets].sort((left, right) => {
    const leftPreferred = preferred.has(left.id) ? 0 : 1;
    const rightPreferred = preferred.has(right.id) ? 0 : 1;
    if (leftPreferred !== rightPreferred) return leftPreferred - rightPreferred;
    return String(left.name ?? left.id).localeCompare(String(right.name ?? right.id));
  });
}
