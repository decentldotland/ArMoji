export async function handle(state, action) {
  const input = action.input;

  if (input.function === "claimArmoji") {
    const { code_points, domain, jwk_n, sig, record_tx } = input;
    _validateCodePoints(code_points);
    _isNotClaimed(code_points);

    await _verifyArSignature(jwk_n, sig);
    const caller = await _ownerToAddress(jwk_n);
    await _verifyCallerDomain(caller, domain);

    const domainIndex = state.records.findIndex(
      (record) => record.domain === domain
    );
    _validateCodePointsLimitPerDomain(domain, code_points);

    if (domainIndex < 0) {
      const records_obj = {};
      records_obj[JSON.stringify(code_points)] = record_tx;
      state.records.push({
        domain: domain,
        records: records_obj,
        allowance: state.allowance[`l${domain.length}`] - 1,
      });

      return { state };
    }

    ContractAssert(
      !!state.records[domainIndex].allowance,
      "ERROR_DOMAIN_REACHED_ALLOWANCE"
    );
    state.records[domainIndex].records[JSON.stringify(code_points)] = record_tx;
    state.records[domainIndex].allowance -= 1;
    return { state };
  }

  if (input.function === "updateArmojiRecord") {
    const { jwk_n, sig, domain, code_points, record_tx } = input;

    _validateCodePoints(code_points);

    await _verifyArSignature(jwk_n, sig);
    const caller = await _ownerToAddress(jwk_n);
    await _verifyCallerDomain(caller, domain);

    const domainIndex = state.records.findIndex(
      (record) => record.domain === domain
    );

    ContractAssert(domainIndex >= 0, "ERROR_RECORD_DOMAIN_NOT_FOUND");
    const recordObj = state.records[domainIndex];
    ContractAssert(
      !!recordObj.records[JSON.stringify(code_points)],
      "ERROR_CODE_POINTS_NOT_FOUND"
    );
    state.records[domainIndex].records[JSON.stringify(code_points)] = record_tx;
    return { state };
  }

  if (input.function === "delArmojiRecord") {
    const { jwk_n, sig, domain, code_points, record_tx } = input;

    _validateCodePoints(code_points);

    await _verifyArSignature(jwk_n, sig);
    const caller = await _ownerToAddress(jwk_n);
    await _verifyCallerDomain(caller, domain);

    const domainIndex = state.records.findIndex(
      (record) => record.domain === domain
    );

    ContractAssert(domainIndex >= 0, "ERROR_RECORD_DOMAIN_NOT_FOUND");
    const recordObj = state.records[domainIndex];
    ContractAssert(
      !!recordObj.records[JSON.stringify(code_points)],
      "ERROR_CODE_POINTS_NOT_FOUND"
    );
    state.records[domainIndex].allowance += 1;
    delete state.records[domainIndex].records[JSON.stringify(code_points)];
    return { state };
  }

  // ADMIN functions
  if (input.function === "addCodePoint") {
    const { jwk_n, sig, code_point } = input;

    await _verifyArSignature(jwk_n, sig);
    const caller = await _ownerToAddress(jwk_n);
    ContractAssert(caller === state.admin, "ERROR_INVALID_CALLER");
    ContractAssert(
      typeof code_point === "string" &&
        code_point.trim().length &&
        !state.supported_code_points.includes(code_point.trim()),
      "ERROR_NEW_CODE_POINT_INVALID"
    );
    state.supported_code_points.push(code_point.trim());

    return { state };
  }

  if (input.function === "removeCodePoint") {
    const { jwk_n, sig, code_point } = input;

    await _verifyArSignature(jwk_n, sig);
    const caller = await _ownerToAddress(jwk_n);
    ContractAssert(caller === state.admin, "ERROR_INVALID_CALLER");
    ContractAssert(
      typeof code_point === "string" &&
        code_point.trim().length &&
        state.supported_code_points.includes(code_point.trim()),
      "ERROR_NEW_CODE_POINT_INVALID"
    );
    const codePointIndex = state.supported_code_points.findIndex(
      (point) => point === code_point.trim()
    );
    state.supported_code_points.splice(codePointIndex, 1);

    return { state };
  }

  if (input.function === "updateSigMessage") {
    const { jwk_n, sig, message } = input;

    await _verifyArSignature(jwk_n, sig);
    const caller = await _ownerToAddress(jwk_n);
    ContractAssert(caller === state.admin, "ERROR_INVALID_CALLER");
    ContractAssert(
      typeof message === "string" &&
        message.trim().length &&
        message !== state.sig_message,
      "ERROR_INVALID_NEW_SIG_MESSAGE"
    );
    state.sig_message.push(message.trim());
    state.signatures = [];
    return { state };
  }

  // HELPER FUNCTIONS

  function _validateCodePoints(codes) {
    for (const code of codes) {
      ContractAssert(
        state.supported_code_points.includes(code.toLowerCase()),
        "ERROR_CODE_POINT_NOT_SUPPORTED"
      );
    }
  }

  function _isNotClaimed(code_points) {
    const stateCodePoints = state.records
      .map((record) => Object.keys(record.records))
      .flat();
    ContractAssert(
      !stateCodePoints.includes(JSON.stringify(code_points)),
      "ERROR_ARMOJI_ALREADY_CLAIMED"
    );
  }

  function _validateCodePointsLimitPerDomain(domain, code_points) {
    domain.length <= 4 ? ContractAssert(code_points.length <= 5) : void 0;
    domain.length <= 10 && domain.length >= 5
      ? ContractAssert(code_points.length >= 3 && code_points.length <= 5)
      : void 0;
    domain.length <= 15 && domain.length >= 11
      ? ContractAssert([4, 5].includes(code_points.length))
      : void 0;
  }

  function _validateArweaveAddress(address) {
    ContractAssert(
      /[a-z0-9_-]{43}/i.test(address),
      "ERROR_INVALID_ARWEAVE_ADDRESS"
    );
  }

  function _validateOwnerSyntax(owner) {
    ContractAssert(
      typeof owner === "string" && owner?.length === 683,
      "ERROR_INVALID_JWK_N_SYNTAX"
    );
  }

  async function _verifyCallerDomain(caller, domain) {
    const ans_state = await _getAnsState();
    const isOwner = ans_state
      .find((user) => user.address === caller)
      .ownedDomains?.map((domainObject) => domainObject.domain)
      ?.includes(domain);
    ContractAssert(isOwner, "ERROR_CALLER_NOT_DOMAIN_OWNER");
  }

  async function _ownerToAddress(pubkey) {
    try {
      _validateOwnerSyntax(pubkey);
      const req = await EXM.deterministicFetch(
        `${state.ar_molecule_endpoint}/ota/${pubkey}`
      );
      const address = req.asJSON()?.address;
      _validateArweaveAddress(address);
      return address;
    } catch (error) {
      throw new ContractError("ERROR_MOLECULE_SERVER_ERROR");
    }
  }

  async function _getAnsState() {
    try {
      const req = await EXM.deterministicFetch(
        `https://api.exm.dev/read/${state.ans_contract_address}`
      );
      return req.asJSON()?.balances;
    } catch (error) {
      throw new ContractError("ERROR_EXM_FETCH_REQUEST");
    }
  }

  async function _verifyArSignature(owner, signature) {
    try {
      ContractAssert(
        !state.signatures.includes(signature),
        "ERROR_SIGNATURE_ALREADY_USED"
      );

      const encodedMessage = new TextEncoder().encode(
        state.sig_message[state.sig_message.length - 1]
      );
      const typedArraySig = Uint8Array.from(atob(signature), (c) =>
        c.charCodeAt(0)
      );
      const isValid = await SmartWeave.arweave.crypto.verify(
        owner,
        encodedMessage,
        typedArraySig
      );

      ContractAssert(isValid, "ERROR_INVALID_CALLER_SIGNATURE");

      state.signatures.push(signature);
    } catch (error) {
      throw new ContractError("ERROR_INVALID_CALLER_SIGNATURE");
    }
  }
}
