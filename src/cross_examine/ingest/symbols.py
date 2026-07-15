"""Deterministic Python symbol discovery for changed files."""

from __future__ import annotations

import ast
import re
from pathlib import Path, PurePosixPath

from cross_examine.schema import TouchedSymbol

_PYTHON_FILE_HEADER = re.compile(r"^(?:--- a/|\+\+\+ b/)(.+\.py)$", re.MULTILINE)


def discover_touched_symbols(diff: str, base_path: Path, head_path: Path) -> list[TouchedSymbol]:
    discovered: dict[str, TouchedSymbol] = {}
    for relative in sorted(set(_PYTHON_FILE_HEADER.findall(diff))):
        source_path = head_path / Path(PurePosixPath(relative))
        if not source_path.is_file():
            source_path = base_path / Path(PurePosixPath(relative))
        if not source_path.is_file():
            continue
        module = module_name(relative)
        tree = ast.parse(source_path.read_text(encoding="utf-8"), filename=relative)
        for qualname in _SymbolVisitor().collect(tree):
            target = f"{module}:{qualname}"
            discovered[target] = TouchedSymbol(
                module=module,
                qualname=qualname,
                target_symbol=target,
                file_path=relative,
            )
    return [discovered[target] for target in sorted(discovered)]


def module_name(relative_path: str) -> str:
    parts = list(PurePosixPath(relative_path).with_suffix("").parts)
    if parts and parts[0] == "src":
        parts.pop(0)
    if parts and parts[-1] == "__init__":
        parts.pop()
    return ".".join(parts)


class _SymbolVisitor(ast.NodeVisitor):
    def __init__(self) -> None:
        self.stack: list[str] = []
        self.symbols: list[str] = []

    def collect(self, tree: ast.AST) -> list[str]:
        self.visit(tree)
        return self.symbols

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        self._visit_symbol(node)

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self._visit_symbol(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        self._visit_symbol(node)

    def _visit_symbol(self, node: ast.ClassDef | ast.FunctionDef | ast.AsyncFunctionDef) -> None:
        self.stack.append(node.name)
        self.symbols.append(".".join(self.stack))
        self.generic_visit(node)
        self.stack.pop()
